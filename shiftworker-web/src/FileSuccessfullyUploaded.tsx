import React from "react";
import {
  Button,
  Code,
  HStack,
  Link,
  Stack,
  Text,
  useClipboard,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";

export const FileSuccessfullyUploaded = ({ url }: { url: string }) => {
  const { onCopy, value, setValue, hasCopied } = useClipboard(url);
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
    </Stack>
  );
};
