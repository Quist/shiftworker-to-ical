"use client";

import { Box, Flex, HStack, useColorModeValue } from "@chakra-ui/react";

export const NavBar = () => {
  return (
    <>
      <Box px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <HStack spacing={8} alignItems={"center"}></HStack>
          <Flex alignItems={"center"}>
            <NavLink href={"https://github.com/Quist/shiftworker-to-ical"}>
              {"GitHub"}
            </NavLink>
            <NavLink href={"https://twitter.com/liquister"}>
              {"Twitter"}
            </NavLink>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

interface Props {
  children: React.ReactNode;
  href: string;
}

const NavLink = (props: Props) => {
  const { children, href } = props;

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={"md"}
      _hover={{
        textDecoration: "none",
        bg: useColorModeValue("gray.200", "gray.700"),
      }}
      href={href}
    >
      {children}
    </Box>
  );
};
