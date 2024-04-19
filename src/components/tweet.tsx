import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;
const Column = styled.div``;
const EditColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  margin-left: 10px;
  align-items: center;
`;
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const TextArea = styled.textarea`
  border: 2px dotted white;
  padding: 20px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apply-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", san-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 5px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  text-transform: uppercase;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  text-transform: uppercase;
  margin-left: 5px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  text-transform: uppercase;
  margin-left: 5px;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  text-transform: uppercase;
  cursor: pointer;
`;

const AttachFileButton = styled.label`
  background-color: black;
  color: #1d9bf0;
  border-color: #1d9bf0;
  font-weight: 600;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
`;
const DeleteAttachFileButton = styled.label`
  background-color: black;
  color: tomato;
  border-color: tomato;
  font-weight: 600;
  border: 1px solid tomato;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
`;
const AttachFileInput = styled.input`
  display: none;
`;
export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isEdit, setEdit] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editTweet, setEditTweet] = useState(tweet);
  const [isDeletedPhoto, setDeletedPhoto] = useState(!photo);

  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok && user?.uid === userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user?.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const onEdit = () => {
    setEdit(true);
  };
  const onSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      if (file && file.size > 1024 ** 2) return;

      if (photo && isDeletedPhoto) {
        const photoRef = ref(storage, `tweets/${user?.uid}/${id}`);
        await deleteObject(photoRef);
      }

      const editDoc = doc(db, "tweets", id);

      let url = "";
      if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${editDoc.id}`);
        const result = await uploadBytes(locationRef, file);
        url = await getDownloadURL(result.ref);
      }

      await updateDoc(doc(db, "tweets", id), {
        tweet: editTweet,
        photo: url,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(false);
      setFile(null);
      setEditTweet(tweet);
      setDeletedPhoto(!file);
    }
  };
  const onCancel = () => {
    setEdit(false);
    setFile(null);
    setEditTweet(tweet);
    setDeletedPhoto(!photo);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setFile(files[0]);
      setDeletedPhoto(true);
    }
  };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditTweet(e.target.value);
  };
  const onDeleteFile = () => {
    setDeletedPhoto(true);
  };
  return (
    <Wrapper>
      {!isEdit ? (
        <Column>
          <Username>{username}</Username>
          <Payload>{tweet}</Payload>
          {user?.uid === userId && (
            <ButtonGroup>
              <DeleteButton onClick={onDelete}>Delete</DeleteButton>
              <EditButton onClick={onEdit}>Edit</EditButton>
            </ButtonGroup>
          )}
        </Column>
      ) : (
        <EditColumn>
          <Username>{username}</Username>
          <TextArea
            onChange={onChange}
            value={editTweet}
            rows={3}
            maxLength={150}
            placeholder="What is happening?"
            required
          ></TextArea>
          <AttachFileButton htmlFor={`file_${id}`}>
            {file ? "Photo added ✅" : "Add photo"}
          </AttachFileButton>
          <AttachFileInput onChange={onFileChange} type="file" id={`file_${id}`} accept="image/*" />
          <ButtonGroup>
            <CancelButton onClick={onCancel}>Cancel</CancelButton>
            <SaveButton onClick={onSave}>Save</SaveButton>
          </ButtonGroup>
        </EditColumn>
      )}
      {!isDeletedPhoto && (
        <Column>
          <Photo src={photo} />
          {!isDeletedPhoto && isEdit && (
            <DeleteAttachFileButton onClick={onDeleteFile}>Delte Photo</DeleteAttachFileButton>
          )}
        </Column>
      )}
    </Wrapper>
  );
}
