import { ReactComponentElement } from 'react'
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Merge,
  Path,
} from 'react-hook-form'

interface TextAreaProps<T extends FieldValues> {
  label: string
  placeholder: string
  control: Control<T>
  name: Path<T>
  icon?: ReactComponentElement<any>
  errors?: Merge<FieldError, (FieldError | undefined)[]>
}

export function TextArea<T extends FieldValues>({
  label,
  placeholder,
  control,
  name,
  icon,
  errors,
}: TextAreaProps<T>) {
  const _errors = createArrayFromFieldErrors(errors)
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange } }) => {
        return (
          <div
            className={`form-control w-full text-gray-400 ${
              _errors?.length && '!text-error'
            }`}
          >
            <label className={`label p-0 ml-4`}>
              <span
                className={`label-text leading-6 ${
                  _errors?.length && '!text-error'
                }`}
              >
                {label}
              </span>
            </label>
            <div className="relative focus-within:text-gray-600">
              {icon}
              <textarea
                onChange={(e) => {
                  const value = e.target.value
                  onChange(value.trim().split('\n'))
                }}
                placeholder={placeholder}
                className={`textarea h-16 resize-none	 w-full text-sm bg-lightHover text-gray-600 leading-6 placeholder:font-normal focus-within:placeholder:font-normal font-bold ${
                  _errors?.length && '!textarea-error !bg-error !bg-opacity-20'
                } ${icon && 'pl-12'}`}
              />
            </div>
            {_errors?.map((error, index) => (
              <p
                key={index}
                className="text-error text-left ml-4 text-sm leading-6"
              >
                {error?.message}
              </p>
            ))}
          </div>
        )
      }}
    />
  )
}

function createArrayFromFieldErrors(
  errors?: Merge<FieldError, FieldError | undefined[]>,
) {
  return !errors || Array.isArray(errors) ? errors : [errors]
}
