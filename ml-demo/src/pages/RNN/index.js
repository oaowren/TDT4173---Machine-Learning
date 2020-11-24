import React from "react";
import word_index from "../../assets/word_index.json";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Button, TextField, Box, LinearProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const tokenizer = text => {
  let tokens = text
    .toLowerCase()
    .replace(/[^(a-zA-Z0-9)\s*+\-/=&|]/, "")
    .replace(/[!"#$%&()*+,\-./:;=?@[\\\]^_`{|}~\t\n\r]/g, " ")
    .replace(/\s{2,}/g, " ")
    .split(" ")
    .slice(0, 75);

  let size = tokens.length;
  for (let i = 0; i < size; i++) {
    const token = word_index[tokens[i]];
    tokens[i] = token ? token : null;
  }
  tokens = tokens.filter(p => p != null);
  size = tokens.length;
  if (size < 75) {
    for (let i = 0; i < 75 - size; i++) {
      tokens.unshift(0);
    }
  }
  return tokens;
};

const Recurrent = () => {
  const [question, setQuestion] = React.useState("");
  const [pred, setPred] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const requestPred = () => {
    setIsLoading(true);
    fetch('http://localhost:5001/tdt4173-project-sl-1/us-central1/getQuestionQuality',{
      method: 'POST',
      mode: 'cors', 
      'Content-Type': 'application/json',
      body: JSON.stringify({
        "instances": [tokenizer(question)]
      })
    })
      .then(response=>response.json())
      .then(response => {
        console.log(response);
        setPred(response.predictions[0])
      })
      .catch(err => console.log(err))
      .finally(()=> setIsLoading(false));
  }

  return (
    <>
      <Box display="flex" flexDirection="column" mx={4} height={"90vh"}>
        <Box><h1>Recurrent Neural Network with LSTM</h1></Box>
        <Box my={"auto"} mx={"auto"} width={"90%"} maxWidth={"800px"}> 
        {
            (pred || isLoading ) ? <>
              { 
                isLoading ? <LinearProgress color="secondary" /> 
                : <>
                  {
                    pred && pred[0] > pred[1] && pred[0] > pred[2] && <Alert severity="error">This is likely a bad question: Our model is {Math.floor(pred[0]*100)}% confident that this question will receive a negative score and be closed without a single edit.</Alert>
                  }
                  {
                    pred && pred[1] > pred[0] && pred[1] > pred[2] && <Alert severity="warning">This question could be improved: Our model is {Math.floor(pred[1]*100)}% confident that this question will receive a negative score and receive multiple community edits.</Alert>
                  }
                  {
                    pred && pred[2] > pred[0] && pred[2] > pred[1] && <Alert severity="success">Great job! Our model is {Math.floor(pred[2]*100)}% confident that this question will get a 30+ score and not have a single edit.</Alert>
                  }
                </>
              }
            </> : <Alert severity="info">What would you like to ask the StackOverflow community about today?</Alert>
        }
        </Box>
        <Box flexDirection="column" my={"auto"} mx={"auto"} width={"90%"} maxWidth={"800px"}>
          <TextField 
            id="filled-basic" 
            label="Stackoverflow question" 
            variant="outlined" 
            multiline={true}
            fullWidth={true}
            rows={15} 
            onChange={(e) => setQuestion(e.target.value)} 
          />
          <Box mt={4}>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon/>}
              color="secondary"
              onClick={(e) => requestPred()}
            >
              Predict
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Recurrent;
