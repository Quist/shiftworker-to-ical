import React from "react";
import {
  Button,
  Code,
  Link,
  Stack,
  Text,
  useClipboard,
  useToast,
} from "@chakra-ui/react";

export const FileSuccessfullyUploaded = ({
  url,
  onReset,
}: {
  url: string;
  onReset: () => void;
}) => {
  const { onCopy } = useClipboard(url);
  const toast = useToast();

  return (
    <Stack>
      <Stack direction="row" flexWrap={"wrap"} justifyContent={"center"}>
        <Code children={url} />
        <Button
          onClick={() => {
            onCopy();
            toast({
              title: "Copied",
              status: "success",
              duration: 1000,
              isClosable: true,
            });
          }}
        >
          ✂️
        </Button>
      </Stack>
      <Text fontSize="sm">
        Import the URL to{" "}
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
      <Button marginTop={12} onClick={onReset}>
        Upload another
      </Button>
    </Stack>
  );
};
