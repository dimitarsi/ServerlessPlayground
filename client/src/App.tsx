import React, { FormEventHandler } from "react";

export const App = () => {
  const submitForm: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jsonPayload = formData;

    const response = await window.fetch(
      `${API_ENDPOINT}${UPLOAD_URL}?target=foobar`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      }
    );

    console.log(await response.json());
  };
  return (
    <>
      <form onSubmit={submitForm}>
        <fieldset>
          <input type="password" name="password" />
          <button role="submit">Get Presigned URL</button>
        </fieldset>
      </form>
      <form>
        <hr />
        <input type="file" />
        <button role="submit">Submit</button>
      </form>
    </>
  );
};
