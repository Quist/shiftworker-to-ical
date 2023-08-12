import React, { useRef, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { LearnMoreModal } from "./LearnMoreModal";

export const UploadFilePage = ({
  onSuccess,
}: {
  onSuccess: (result: { url: string }) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onFileSelected = (files: FileList) => {
    setError(null);
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      try {
        const result = await postToBackend(text as string);
        onSuccess({ url: result });
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(files[0]);
  };

  return (
    <>
      <LearnMoreModal isOpen={isOpen} onClose={onClose} />
      <Stack
        direction={"column"}
        spacing={3}
        align={"center"}
        alignSelf={"center"}
        position={"relative"}
      >
        <>
          <FileInput onChange={onFileSelected} isLoading={isLoading} />
          {error && (
            <Alert status="error">
              <AlertIcon />
              There was an error processing your request
            </Alert>
          )}
          <Button
            variant={"link"}
            colorScheme={"blue"}
            size={"sm"}
            onClick={onOpen}
          >
            Learn more
          </Button>
        </>
      </Stack>
    </>
  );
};

const FileInput = (props: {
  onChange: (files: FileList) => void;
  isLoading: boolean;
}) => {
  const inputRef = useRef<any>();

  return (
    <FormControl>
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          const input = e.target as HTMLInputElement;
          if (!input.files) {
            return;
          }
          props.onChange(input.files);
        }}
      />
      <Button
        onClick={() => inputRef.current.click()}
        isLoading={props.isLoading}
      >
        Upload Shiftworker File
      </Button>
    </FormControl>
  );
};

const postToBackend = async (payload: string): Promise<string> => {
  const response = await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp",
    {
      method: "post",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
    }
  );
  if (!response.ok) {
    throw Error(`Backend returned error code: ${response.status}`);
  }
  return await response.text();
};
