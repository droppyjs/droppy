import {Button, Input} from "@material-ui/core"
import {useRouter} from "next/router"
import React from "react"
import {Form, Field} from "react-final-form"
import {login} from "../../services/auth/login"

export function LoginForm() {
  const router = useRouter()

  const onSubmit = async ({username, password}) => {
    const result = await login(username, password, true)
    if (result !== null) {
      void router.push("/")
    } else {
      // handle?
    }
  }

  const validate = () => {
    return {}
  }

  return (
    <Form
      onSubmit={onSubmit}
      validate={validate}
      render={({handleSubmit}) => (
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div>
            <Field name="username">
              {(props) => <Input {...props.input} placeholder="Username" type="text" />}
            </Field>
          </div>
          <div>
            <Field name="password">
              {(props) => <Input {...props.input} placeholder="Password" type="password" />}
            </Field>
          </div>
          <Button
            type="button"
            color="primary"
            className="form__custom-button"
            onClick={handleSubmit}
          >
            Log in
          </Button>
        </form>
      )}
    />
  )
}
