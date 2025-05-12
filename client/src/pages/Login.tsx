import { Button, Card, Input, Form } from "antd"
import useLogin from "@/hooks/auth/useLogin"

import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { TEXT_REQUIRED } from "@/constants"
type Inputs = {
  email: string | number
  password: string | number
}
export default function Login() {
  const {
    control: control,
    handleSubmit: handleSubmit,
    formState: { errors: errors },
  } = useForm<Inputs>()

  const { isPending, mutateAsync: login } = useLogin()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await login(data)
  }

  return (
    <div className="h-screen flex items-center">
      <div className="max-w-2xl min-w-[400px] mx-auto">
        <Card title={<p className="text-2xl font-bold">Login</p>}>
          <Form>
            <div>
              <label className="font-bold">Email</label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: TEXT_REQUIRED,
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "invalid email address",
                  },
                }}
                render={({ field }) => <Input {...field} placeholder="Email" />}
              />
              {errors.email && <span className="text-red-500">{errors.email.message}</span>}
            </div>
            <div className="mt-4">
              <label className="font-bold">Mật khẩu</label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: TEXT_REQUIRED,
                  },
                }}
                render={({ field }) => <Input type="password" {...field} placeholder="Mật khẩu" />}
              />
              {errors.password && <span className="text-red-500">{errors.password.message}</span>}
            </div>
            <Button
              disabled={isPending}
              size="large"
              className="w-full !font-bold mt-5"
              type="primary"
              onClick={handleSubmit(onSubmit)}
              htmlType="submit"
            >
              {isPending ? "Submiting..." : "Submit"}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  )
}
