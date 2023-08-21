export const postToBackend = async (payload: string): Promise<string> => {
  const response = await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp?" +
      new URLSearchParams({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
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
