import {
  FieldError,
  FieldValues,
  Merge,
  Path,
  UseFormRegister,
} from 'react-hook-form'
import { TextSm } from './Typography'

interface Option<T extends string | number | readonly string[] | undefined> {
  value: T
  label: string
  always?: boolean
  disabled?: boolean
}

interface CheckboxProps<
  T extends FieldValues,
  O extends string | number | readonly string[] | undefined,
> {
  options: Option<O>[]
  name: Path<T>
  label: string
  placeholder: string
  register: UseFormRegister<T>
  errors?: Merge<FieldError, (FieldError | undefined)[]>
}

export function Checkbox<
  T extends FieldValues,
  O extends string | number | readonly string[] | undefined,
>({ options, name, label, register, errors }: CheckboxProps<T, O>) {
  const errorsArray: FieldError[] = Array.isArray(errors)
    ? errors.filter(Boolean)
    : [errors].filter(Boolean)
  return (
    <div
      className={`form-control w-full text-gray-400 ${
        errorsArray?.length && 'text-error'
      }`}
    >
      <label className={`label p-0 ml-4`}>
        <span
          className={`label-text leading-6 ${
            errorsArray?.length && 'text-error'
          }`}
        >
          {label}
        </span>
      </label>
      <div className="flex flex-row gap-4 font-bold">
        {options.map((option) => (
          <label
            key={JSON.stringify(option.value)}
            className={`label flex flex-row gap-2 items-center ${
              option.disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <input
              checked={option.always}
              value={option.value}
              type="checkbox"
              className={`checkbox ${option.disabled && 'opacity-25'}`}
              onClick={(e) => {
                if (option.disabled) e.preventDefault()
              }}
              {...register(name)}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
      <div className="ml-4">
        {errorsArray?.map((error, index) => (
          <TextSm key={index} className="text-error text-left">
            {error?.message}
          </TextSm>
        ))}
      </div>
    </div>
  )
}
