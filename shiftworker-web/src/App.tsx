import {
  Box,
  Code,
  Container,
  Fade,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { UploadFilePage } from "./UploadFilePage";
import { NavBar } from "./Navbar";
import { FileSuccessfullyUploaded } from "./FileSuccessfullyUploaded";

export const App = () => {
  return (
    <>
      <NavBar />
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
    | { state: "file_upload" }
    | { state: "successful_upload"; response: { url: string } }
  >({ state: "file_upload" });

  return (
    <>
      {appState.state === "file_upload" && (
        <UploadFilePage
          onSuccess={(response) =>
            setAppState({ state: "successful_upload", response })
          }
        />
      )}
      <Fade in={appState.state === "successful_upload"}>
        {appState.state === "successful_upload" && (
          <FileSuccessfullyUploaded url={appState.response.url} />
        )}
      </Fade>
    </>
  );
};
