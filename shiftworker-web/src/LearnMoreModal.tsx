import {
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";

export const LearnMoreModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>📝 How to</ModalHeader>

        <ModalBody>
          <Stack spacing={5}>
            <Stack>
              <Heading size={"sm"}>📱 Step 1: Open Shiftworker App 📱</Heading>
              <Text>
                Launch the Shiftworker app on your device to begin the process.
              </Text>
            </Stack>
            <Stack>
              <Heading size={"sm"}>🚀 Step 2: Press Share Icon 🚀</Heading>
              <Text>
                Within the app, tap the share icon to set things in motion.
              </Text>
            </Stack>
            <Stack>
              <Heading size={"sm"}>📧 Step 3: Send Email 📧</Heading>
              <Text>
                Select "Send Email" to generate the crucial export file.
              </Text>
            </Stack>
            <Stack>
              <Heading size={"sm"}>💾 Step 4: Save File 💾</Heading>
              <Text>Save the file on your device for the next step.</Text>
            </Stack>
            <Stack>
              <Heading size={"sm"}>⬆️ Step 5: Upload Here ⬆️</Heading>
              <Text>
                Return to our webpage and effortlessly upload the saved file.
              </Text>
            </Stack>
            <Stack marginBottom={3}>
              <Heading size={"sm"}>
                🎉 Step 6: Add to your calendar 🎉
              </Heading>
              <Text>
                Copy the URL and add it to Google Calendar, Apple Calendar,
                Proton Calendar, or any iCal-compatible app.
              </Text>
            </Stack>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
