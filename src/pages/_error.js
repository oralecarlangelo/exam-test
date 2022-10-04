const Error = ({ statusCode }) => (
  <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
);

Error.getInitialProps = ({ response, error }) => {
  if (response) {
    return { statusCode: response.statusCode };
  }

  return { statusCode: error ? error.statusCode : 404 };
};

export default Error;
