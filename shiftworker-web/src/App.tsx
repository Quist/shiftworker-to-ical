import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Code,
  Container,
  FormControl,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";

export const App = () => {
  return (
    <>
      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Seamlessly export your Shiftworker schedules to <br />
            <Text as={"span"} color={"green.400"}>
              Google Calendar
            </Text>{" "}
            <br />
          </Heading>
          <Text color={"gray.500"}>
            Consolidate all your commitments in one place: With your work
            schedule alongside personal events, appointments, and reminders, you
            can easily manage your time and avoid conflicts.
          </Text>
          <AppBody />
        </Stack>
      </Container>
    </>
  );
};

const AppBody = () => {
  const [appState, setAppState] = useState<
    "file_upload" | { state: "successful_upload"; response: { url: string } }
  >("file_upload");
  if (appState === "file_upload") {
    return (
      <UploadFilePage
        onSuccess={(response) =>
          setAppState({ state: "successful_upload", response })
        }
      />
    );
  }
  return (
    <Stack>
      <Code>{appState.response.url}</Code>
      <Text fontSize="sm">
        Copy the URL to{" "}
        <Link
          color="teal.500"
          isExternal={true}
          href={
            "https://calendar.google.com/calendar/u/0/r/settings/addbyurl?tab=mc"
          }
        >
          Google Calendar
        </Link>
      </Text>
    </Stack>
  );
};

const UploadFilePage = ({
  onSuccess,
}: {
  onSuccess: (result: { url: string }) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

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
        <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
          Learn more
        </Button>
      </>
    </Stack>
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
