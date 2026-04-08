export const postToBackend = async (payload: string, prefix?: string): Promise<string> => {
  const params: Record<string, string> = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  if (prefix && prefix.trim() !== "") {
    params.prefix = prefix.trim() + ": ";
  }

  const response = await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp?" +
      new URLSearchParams(params),
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
