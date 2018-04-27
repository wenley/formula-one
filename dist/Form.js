var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from "react";
import { assertNever } from "./utils";
var FormContext = React.createContext(null);
function makeNewMeta(draft) {
    return {
        pristine: true,
        submitted: false,
        fields: Object.keys(draft).reduce(function (memo, key) {
            // this seems unsound
            var metaField = {
                touched: false,
                changed: false,
                succeeded: false,
                validationSucceeded: false,
                asyncValidationInFlight: false,
            };
            return Object.assign(memo, (_a = {}, _a[key] = metaField, _a));
            var _a;
        }, {}),
    };
}
var Form = /** @class */ (function (_super) {
    __extends(Form, _super);
    function Form(props) {
        var _this = _super.call(this, props) || this;
        _this.fieldCache = null;
        _this.handleSubmit = function (e) {
            e.preventDefault();
            _this.setState(function (prevState) {
                return {
                    meta: Object.assign({}, prevState.meta, { submitted: true }),
                };
            });
            var errors = _this.makeErrors();
            var fieldErrorsArray = Object.keys(errors.fieldErrors).reduce(function (memo, error) {
                return error === null ? memo : memo.concat([error]);
            }, []);
            if (fieldErrorsArray.length === 0 && errors.formErrors.length === 0) {
                _this.props.onSubmit(_this.state.formState);
            }
        };
        _this.updateField = function (fieldName, newValue) {
            // this.setState({...this.state.formState, [fieldName]: newValue});
            // rework this so there aren't sequenced setState()s, yuck!
            _this.setState(function (prevState) {
                var prevFormState = prevState.formState;
                return {
                    formState: Object.assign({}, prevFormState, (_a = {}, _a[fieldName] = newValue, _a)),
                };
                var _a;
            }, function () {
                // tslint:disable
                // debugger;
                // set succeeded
                var formErrors = [];
                if (_this.props.validations) {
                    _this.props.validations.forEach(function (validation) {
                        formErrors = formErrors.concat(validation(_this.state.formState));
                    });
                }
                var relevantFormErrors = formErrors.filter(function (error) { return error.fields && error.fields.indexOf(fieldName) !== -1; });
                var fieldError = null;
                if (_this.props.fieldValidations) {
                    var validator = _this.props.fieldValidations[fieldName];
                    if (validator) {
                        fieldError = validator(_this.state.formState[fieldName]);
                    }
                }
                if (relevantFormErrors.length === 0 && fieldError === null) {
                    _this.updateFieldMeta(fieldName, "succeeded", true);
                }
            });
            // set changed
            _this.updateFieldMeta(fieldName, "changed", true);
        };
        _this.handleFieldChange = function (fieldName, newValue) {
            if (_this.props.onFieldChange) {
                _this.props.onFieldChange(fieldName, newValue, _this.updateField);
            }
            else {
                _this.updateField(fieldName, newValue);
            }
        };
        _this.handleFieldBlur = function (fieldName) {
            _this.updateFieldMeta(fieldName, "touched", true);
        };
        _this.state = {
            formState: props.initialValue,
            meta: makeNewMeta(props.initialValue),
        };
        return _this;
    }
    Form.prototype.reset = function () {
        this.setState({
            formState: this.props.initialValue,
            meta: makeNewMeta(this.props.initialValue),
        });
    };
    Object.defineProperty(Form.prototype, "fields", {
        get: function () {
            if (this.fieldCache == null) {
                var fields = makeFields(this.state.formState);
                this.fieldCache = fields;
            }
            return this.fieldCache;
        },
        enumerable: true,
        configurable: true
    });
    Form.prototype.shouldShowFeedbackForFields = function (fieldNames) {
        var feedbackStrategy = this.props.feedbackStrategy;
        switch (feedbackStrategy) {
            case "OnFirstBlur":
                for (var _i = 0, fieldNames_1 = fieldNames; _i < fieldNames_1.length; _i++) {
                    var fieldName = fieldNames_1[_i];
                    if (this.state.meta.fields[fieldName].touched === false) {
                        return false;
                    }
                }
                return true;
            case "OnFirstChange":
                for (var _a = 0, fieldNames_2 = fieldNames; _a < fieldNames_2.length; _a++) {
                    var fieldName = fieldNames_2[_a];
                    if (this.state.meta.fields[fieldName].changed === false) {
                        return false;
                    }
                }
                return true;
            case "OnFirstSuccess":
                for (var _b = 0, fieldNames_3 = fieldNames; _b < fieldNames_3.length; _b++) {
                    var fieldName = fieldNames_3[_b];
                    if (this.state.meta.fields[fieldName].succeeded === false) {
                        return false;
                    }
                }
                return true;
            case "OnFirstSuccessOrFirstBlur":
                for (var _c = 0, fieldNames_4 = fieldNames; _c < fieldNames_4.length; _c++) {
                    var fieldName = fieldNames_4[_c];
                    if (!this.state.meta.fields[fieldName].succeeded &&
                        !this.state.meta.fields[fieldName].touched) {
                        return false;
                    }
                }
                return true;
            case "OnSubmit":
                return this.state.meta.submitted;
            default:
                assertNever(feedbackStrategy);
                return false;
        }
    };
    // use the strategy and meta to figure out what errors to show
    Form.prototype.makeErrors = function () {
        var _this = this;
        var fieldErrors = Object.keys(this.props.initialValue).reduce(function (memo, k) {
            return Object.assign(memo, (_a = {}, _a[k] = null, _a));
            var _a;
        }, {});
        if (this.props.fieldValidations) {
            var fieldValidations_1 = this.props.fieldValidations;
            Object.keys(this.props.fieldValidations).forEach(function (k) {
                var typedKey = k;
                if (_this.shouldShowFeedbackForFields([typedKey])) {
                    var validator = fieldValidations_1[typedKey];
                    if (validator) {
                        fieldErrors[typedKey] = validator(_this.state.formState[typedKey]);
                    }
                }
            });
        }
        var formErrors = [];
        if (this.props.validations) {
            this.props.validations.forEach(function (validation) {
                var errors = validation(_this.state.formState);
                var errorsToShow = errors.filter(function (e) {
                    if (e.fields === undefined) {
                        return true;
                    }
                    return _this.shouldShowFeedbackForFields(e.fields);
                });
                formErrors = formErrors.concat(errorsToShow);
            });
        }
        return {
            fieldErrors: fieldErrors,
            formErrors: formErrors,
        };
    };
    Form.prototype.updateFieldMeta = function (fieldName, metaKey, metaValue) {
        this.setState(function (prevState) {
            // return {
            //   meta: {
            //     ...prevState.meta,
            //     fields: {
            //       ...prevState.meta.fields,
            //       [fieldName]: {
            //         ...prevState.meta.fields[fieldName],
            //         touched: true,
            //       },
            //     },
            //   },
            // };
            var prevFieldMeta = prevState.meta.fields[fieldName];
            var newFields = Object.assign({}, prevState.meta.fields, (_a = {},
                _a[fieldName] = Object.assign({}, prevFieldMeta, (_b = {}, _b[metaKey] = metaValue, _b)),
                _a));
            return {
                meta: Object.assign({}, prevState.meta, { fields: newFields }),
            };
            var _a, _b;
        });
    };
    Form.prototype.render = function () {
        return (React.createElement(FormContext.Provider, { value: {
                formState: this.state.formState,
                // Filthy monomorphization lies
                // tslint:disable-next-line no-any
                errors: this.makeErrors(),
                onChange: this.handleFieldChange,
                onBlur: this.handleFieldBlur,
            } }, this.props.children({
            meta: this.state.meta,
            formState: this.state.formState,
            onSubmit: this.handleSubmit,
        }, this.fields)));
    };
    Form.defaultProps = {
        fieldValidations: {},
        validations: [],
        feedbackStrategy: "OnFirstBlur",
    };
    return Form;
}(React.Component));
export default Form;
var Field = /** @class */ (function (_super) {
    __extends(Field, _super);
    function Field() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Field, "fieldName", {
        get: function () {
            throw new Error("tried to get the name of the base Field");
        },
        enumerable: true,
        configurable: true
    });
    Field.prototype.render = function () {
        var _this = this;
        var fieldName = this.constructor.fieldName;
        return (React.createElement(FormContext.Consumer, null, function (context) {
            if (context == null) {
                throw new Error("Trying to use a <Field> outside of a <Form>. This is not currently supported.");
            }
            // other side of the filthy monomorphization lies
            var _a = context, formState = _a.formState, onChange = _a.onChange, onBlur = _a.onBlur, errors = _a.errors;
            // This cast is a little gross, but static properties can't reference type params
            // also the typechecker probably can't prove OutputType === DraftType[fieldName]
            var value = formState[fieldName];
            var fieldError = errors.fieldErrors[fieldName];
            var relevantFormErrors = errors.formErrors.filter(function (error) {
                if (error.fields === undefined) {
                    return false;
                }
                return error.fields.indexOf(fieldName) !== -1;
            });
            var input = _this.props.children({
                value: value,
                formState: formState,
                showError: fieldError !== null || relevantFormErrors.length > 0,
                onChange: function (newValue) {
                    // I think the only way for this to work without casting is if this component
                    // is parameterized on the type of name :-/
                    onChange(_this.constructor.fieldName, 
                    // tslint:disable-next-line no-any
                    newValue);
                },
                onBlur: function () {
                    onBlur(_this.constructor.fieldName);
                },
            });
            if (_this.props.label) {
                return (React.createElement("label", null,
                    _this.props.label,
                    input,
                    fieldError != null ? (React.createElement("span", { className: "errorText" }, fieldError)) : null));
            }
            return input;
        }));
    };
    return Field;
}(React.Component));
export { Field };
function makeFields(draft) {
    return Object.keys(draft).reduce(function (memo, key) {
        // maybe it's okay to use Field in all the positions here as long as the cast is right
        var F = /** @class */ (function (_super) {
            __extends(F, _super);
            function F() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(F, "fieldName", {
                get: function () {
                    return key;
                },
                enumerable: true,
                configurable: true
            });
            return F;
        }(Field));
        return Object.assign(memo, (_a = {}, _a[key] = F, _a));
        var _a;
    }, {});
}
var FormErrors = /** @class */ (function (_super) {
    __extends(FormErrors, _super);
    function FormErrors() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormErrors.prototype.render = function () {
        return (React.createElement(FormContext.Consumer, null, function (context) {
            if (context == null) {
                throw new Error("Trying to use a <FormErrors> outside of a <Form>. This is not currently supported.");
            }
            // other side of the filthy monomorphization lies
            var errors = context.errors;
            return (React.createElement("div", null,
                React.createElement("ul", null, errors.formErrors.map(function (e) {
                    return React.createElement("li", { key: e.message }, e.message);
                }))));
        }));
    };
    return FormErrors;
}(React.Component));
export { FormErrors };
//# sourceMappingURL=Form.js.map