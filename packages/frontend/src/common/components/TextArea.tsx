import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Merge,
  Path,
} from 'react-hook-form'
import { tv } from 'tailwind-variants'

interface TextAreaProps<T extends FieldValues> {
  label: string
  placeholder: string
  control: Control<T>
  name: Path<T>
  errors?: Merge<FieldError, (FieldError | undefined)[]>
  additionalClasses?: string
}

export function TextArea<T extends FieldValues>({
  label,
  placeholder,
  control,
  name,
  errors,
  additionalClasses,
}: TextAreaProps<T>) {
  const _errors = createArrayFromFieldErrors(errors)
  const classNames = classes({ error: !!_errors?.length })

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange } }) => {
        return (
          <div className={`${classNames.formControl()} ${additionalClasses}`}>
            <label className={`label p-0 ml-4`}>
              <span className={classNames.label()}>{label}</span>
            </label>
            <div className="focus-within:text-gray-600">
              <textarea
                onChange={(e) => {
                  const value = e.target.value
                  onChange(value.trim().split('\n'))
                }}
                placeholder={placeholder}
                className={classNames.input()}
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

const classes = tv({
  slots: {
    input: [
      'textarea',
      'bg-lightHover',
      'resize-none',
      'w-full h-16',
      'text-sm text-gray-600 font-bold leading-6',
      'placeholder:font-normal focus-within:placeholder:font-normal',
    ],
    formControl: ['form-control', 'w-full', 'text-gray-400'],
    label: ['label-text', 'leading-6'],
  },
  variants: {
    icon: {
      true: {
        input: 'pl-12',
      },
    },
    error: {
      true: {
        input: 'input-error bg-error bg-opacity-20',
      },
    },
  },
  compoundSlots: [
    {
      slots: ['formControl', 'label'],
      error: true,
      class: ['text-error'],
    },
  ],
})
