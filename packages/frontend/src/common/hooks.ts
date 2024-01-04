'use client'

import { FieldValues, UseFormProps, useForm } from 'react-hook-form'

export function useFormWithServerError<
  TFieldValues extends FieldValues = FieldValues,
>(props?: UseFormProps<TFieldValues>) {
  interface ServerError {
    server?: never
  }
  return useForm<TFieldValues & ServerError>(props)
}
