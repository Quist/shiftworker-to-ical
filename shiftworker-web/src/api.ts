export const postToBackend = async (
  payload: string,
  calendarName?: string
): Promise<string> => {
  const query = new URLSearchParams({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  if (calendarName?.trim()) {
    query.set("calendarName", calendarName.trim());
  }
  const response = await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp?" +
      query,
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
