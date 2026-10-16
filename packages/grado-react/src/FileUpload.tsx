'use client'
import { forwardRef, useRef, useState } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { fileError, type UploadItem } from '@1k5-tech-es/grado/patterns'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Button } from './Button.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId } from './hooks.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface FileUploadProps {
  label?: string
  hint?: string
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  files?: UploadItem[]
  onFilesChange?: (files: File[]) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  onReject?: (errors: string[]) => void
  className?: string
}
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  {
    label: labelProp,
    hint: hintProp,
    accept,
    maxSize,
    multiple = false,
    disabled,
    files = [],
    onFilesChange,
    onRemove,
    onRetry,
    onReject,
    className,
  },
  ref,
) {
  const input = useRef<HTMLInputElement>(null),
    [errors, setErrors] = useState<string[]>([]),
    [dragging, setDragging] = useState(false)
  const id = useAutoId('k5-upload'),
    { messages: m, locale } = useGrado(),
    label = labelProp ?? m.uploadLabel,
    hint = hintProp ?? m.uploadHint
  const receive = (incoming: File[]) => {
    if (disabled) return
    const rejected: string[] = [],
      valid: File[] = []
    if (!multiple && incoming.length > 1) rejected.push(m.uploadSingle)
    else
      incoming.forEach((file) => {
        const error = fileError(file, accept, maxSize, { messages: m, locale })
        if (error) rejected.push(error)
        else valid.push(file)
      })
    setErrors(rejected)
    if (rejected.length) onReject?.(rejected)
    if (valid.length) onFilesChange?.(valid)
  }
  return (
    <div ref={ref} className={cx('k5-upload', className)}>
      <div
        className="k5-upload__zone"
        data-dragging={dragging}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          receive(Array.from(event.dataTransfer.files))
        }}
      >
        <input
          ref={input}
          type="file"
          hidden
          aria-label={label}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            receive(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
        <span className="k5-upload__icon" aria-hidden="true">
          <PathIcon paths={ICON_PATHS.upload} />
        </span>
        <Button variant="secondary" disabled={disabled} aria-describedby={`${id}-hint`} onClick={() => input.current?.click()}>
          {label}
        </Button>
        <p className="k5-upload__hint" id={`${id}-hint`}>
          {hint}
        </p>
      </div>
      {errors.length > 0 && (
        <div role="alert" className="k5-upload__error">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className="k5-upload__list">
          {files.map((file) => (
            <li className="k5-upload__file" data-status={file.status} key={file.id}>
              <PathIcon paths={ICON_PATHS.file} className="k5-upload__file-icon" />
              <div className="k5-upload__file-content">
                <span className="k5-upload__name">
                  {file.name}
                  {file.status === 'success' && <span className="k5-sr-only">{` ${m.uploadDone}`}</span>}
                </span>
                {file.status === 'uploading' && (
                  <progress
                    className="k5-upload__progress"
                    aria-label={formatMessage(m.uploading, { name: file.name })}
                    value={Math.max(0, Math.min(100, file.progress ?? 0))}
                    max={100}
                  />
                )}
                {file.status === 'error' && (
                  <span className="k5-upload__error" role="alert">
                    {file.error ?? m.uploadFailed}
                  </span>
                )}
              </div>
              {file.status === 'success' && <PathIcon paths={ICON_PATHS.check} className="k5-upload__done" />}
              {file.status === 'error' && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label={formatMessage(m.retryFile, { name: file.name })}
                  onClick={() => onRetry(file.id)}
                >
                  {m.retry}
                </Button>
              )}
              {onRemove && (
                <button
                  type="button"
                  className="k5-close"
                  disabled={disabled}
                  aria-label={formatMessage(m.removeFile, { name: file.name })}
                  onClick={() => onRemove(file.id)}
                >
                  {closeIcon}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
