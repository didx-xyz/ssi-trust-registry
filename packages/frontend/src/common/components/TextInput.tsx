import { ReactComponentElement } from 'react'
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { tv } from 'tailwind-variants'

interface TextInputProps<T extends FieldValues> {
  type: string
  name: Path<T>
  label: string
  placeholder: string
  register: UseFormRegister<T>
  icon?: ReactComponentElement<any>
  error?: FieldError
  additionalClasses?: string
}

export function TextInput<T extends FieldValues>({
  type,
  name,
  label,
  placeholder,
  register,
  icon,
  error,
  additionalClasses,
}: TextInputProps<T>) {
  const classNames = classes({ error: !!error?.message, icon: !!icon })
  return (
    <div className={`${classNames.formControl()} ${additionalClasses}`}>
      <label className={`label p-0 ml-4`}>
        <span className={classNames.label()}>{label}</span>
      </label>
      <div className="relative focus-within:text-gray-600">
        {icon && <div className={classNames.icon()}>{icon}</div>}
        <input
          type={type}
          placeholder={placeholder}
          className={classNames.input()}
          {...register(name)}
        />
      </div>
      {error?.message && (
        <p className="ml-4 text-error text-left text-sm leading-6">
          {error?.message}
        </p>
      )}
    </div>
  )
}

const classes = tv({
  slots: {
    input: [
      'input',
      'bg-lightHover',
      'w-full leading-6',
      'text-sm text-gray-600 font-bold',
      'placeholder:font-normal focus-within:placeholder:font-normal',
    ],
    formControl: ['form-control', 'w-full', 'text-gray-400'],
    label: ['label-text', 'leading-6'],
    icon: [
      'pointer-events-none',
      'w-6 h-6',
      'absolute left-3 top-1/2 transform -translate-y-1/2',
    ],
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
