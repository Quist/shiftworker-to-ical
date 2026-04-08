import React, { useRef, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { LearnMoreModal } from "./LearnMoreModal";
import { postToBackend } from "./api";

export const UploadFilePage = ({
  onSuccess,
}: {
  onSuccess: (result: { url: string }) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [prefix, setPrefix] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onFileSelected = (files: FileList) => {
    setError(null);
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      try {
        const result = await postToBackend(text as string, prefix);
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
      <Stack direction={"column"} spacing={3} position={"relative"}>
        <>
          <FileInput onChange={onFileSelected} isLoading={isLoading} />
          {error && (
            <Alert status="error">
              <AlertIcon />
              There was an error processing your request
            </Alert>
          )}
          <Accordion
            maxW={"md"}
            marginTop={4}
            marginBottom={4}
            alignSelf={"center"}
            allowToggle
          >
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="center" fontSize={"sm"}>
                    Advanced
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Advanced isOpen={true} prefix={prefix} setPrefix={setPrefix} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
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
        variant={"solid"}
        colorScheme="teal"
      >
        Upload Shiftworker File
      </Button>
    </FormControl>
  );
};

const Advanced = ({
  isOpen,
  prefix,
  setPrefix,
}: {
  isOpen: boolean;
  prefix: string;
  setPrefix: (value: string) => void;
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <Stack spacing={3}>
      <Box>
        <Heading size={"xs"} mb={1}>Timezone</Heading>
        <Text fontSize={"sm"}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</Text>
      </Box>
      <FormControl>
        <FormLabel htmlFor="prefix" fontSize={"xs"}>
          Name prefix (optional)
        </FormLabel>
        <Input
          id="prefix"
          size="sm"
          placeholder="e.g. Your Name"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />
        <Text fontSize={"xs"} color={"gray.500"} mt={1}>
          Will be added to the beginning of each shift (e.g. "John: Evening shift")
        </Text>
      </FormControl>
    </Stack>
  );
};
