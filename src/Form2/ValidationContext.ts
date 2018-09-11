import * as React from "react";

import {FeedbackStrategy} from "./types";

export interface ValidationContextPayload {
  submitted: boolean;
  feedbackStrategy: FeedbackStrategy;
}
const ValidationContext = React.createContext({
  feedbackStrategy: "OnSubmit",
  submitted: true, // if we aren't in a form, just act like we've submitted
}) as React.Context<ValidationContextPayload>;

export default ValidationContext;
