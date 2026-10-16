# API de @1k5-tech-es/grado-react/react-hook-form

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

Tipos exportados: FormErrorSummaryProps, FormFieldProps, FormProps

## ErrorSummary

ref: HTMLDivElement

```ts
  className?: string
  title?: string
```

## Form

ref: HTMLFormElement · admite además los atributos HTML de ese elemento

```ts
  defaultValues?: DefaultValues<T>
  errors?: Partial<Record<Path<T>, string>>
  form?: UseFormReturn<T>
  mode?: "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all"
  onInvalid?: SubmitErrorHandler<T>
  onSubmit: SubmitHandler<T>
```

## FormField

ref: HTMLDivElement

```ts
  children: ReactElement<unknown, string | React.JSXElementConstructor<any>>
  className?: string
  defaultValue?: unknown
  hint?: ReactNode
  id?: string
  label?: ReactNode
  name: Path<T>
  required?: boolean
  validate?: FieldCheck | FieldCheck[]
```
