import { defineComponent, h, ref, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5/grado/classes'
import { fileError, type UploadItem } from '@1k5/grado/patterns'
import { Button } from './Button.js'
import { pathIcon } from './PathIcon.js'
import { formatMessage } from '@1k5/grado/messages'
import { useGrado } from './Locale.js'
import { autoId } from './helpers.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)

export const FileUpload = defineComponent({
  name: 'K5FileUpload',
  props: {
    label: String,
    hint: String,
    accept: String,
    maxSize: Number,
    multiple: Boolean,
    disabled: Boolean,
    files: { type: Array as PropType<UploadItem[]>, default: () => [] },
    removable: Boolean,
    retryable: Boolean,
  },
  emits: ['filesChange', 'remove', 'retry', 'reject'],
  setup(props, { emit }) {
    const input = ref<HTMLInputElement>(),
      errors = ref<string[]>([]),
      dragging = ref(false),
      id = autoId('k5-upload'),
      t = useGrado()
    const receive = (incoming: File[]) => {
      if (props.disabled) return
      const rejected: string[] = [],
        valid: File[] = []
      if (!props.multiple && incoming.length > 1) rejected.push(t.value.messages.uploadSingle)
      else
        incoming.forEach((file) => {
          const error = fileError(file, props.accept, props.maxSize, { messages: t.value.messages, locale: t.value.locale })
          if (error) rejected.push(error)
          else valid.push(file)
        })
      errors.value = rejected
      if (rejected.length) emit('reject', rejected)
      if (valid.length) emit('filesChange', valid)
    }
    return () => {
      const m = t.value.messages,
        label = props.label ?? m.uploadLabel
      return h('div', { class: 'k5-upload' }, [
        h(
          'div',
          {
            class: 'k5-upload__zone',
            'data-dragging': dragging.value,
            onDragover: (event: DragEvent) => {
              event.preventDefault()
              if (!props.disabled) dragging.value = true
            },
            onDragleave: (event: DragEvent) => {
              if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) dragging.value = false
            },
            onDrop: (event: DragEvent) => {
              event.preventDefault()
              dragging.value = false
              receive(Array.from(event.dataTransfer?.files ?? []))
            },
          },
          [
            h('input', {
              ref: input,
              type: 'file',
              hidden: true,
              'aria-label': label,
              accept: props.accept,
              multiple: props.multiple,
              disabled: props.disabled,
              onChange: (event: Event) => {
                const target = event.target as HTMLInputElement
                receive(Array.from(target.files ?? []))
                target.value = ''
              },
            }),
            h('span', { class: 'k5-upload__icon', 'aria-hidden': 'true' }, [pathIcon(ICON_PATHS.upload)]),
            h(
              Button,
              { variant: 'secondary', disabled: props.disabled, 'aria-describedby': `${id}-hint`, onClick: () => input.value?.click() },
              { default: () => label },
            ),
            h('p', { class: 'k5-upload__hint', id: `${id}-hint` }, props.hint ?? m.uploadHint),
          ],
        ),
        errors.value.length
          ? h(
              'div',
              { role: 'alert', class: 'k5-upload__error' },
              errors.value.map((error, i) => h('p', { key: i }, error)),
            )
          : null,
        props.files.length
          ? h(
              'ul',
              { class: 'k5-upload__list' },
              props.files.map((file) =>
                h('li', { class: 'k5-upload__file', 'data-status': file.status, key: file.id }, [
                  pathIcon(ICON_PATHS.file, 'k5-upload__file-icon'),
                  h('div', { class: 'k5-upload__file-content' }, [
                    h('span', { class: 'k5-upload__name' }, [
                      file.name,
                      file.status === 'success' ? h('span', { class: 'k5-sr-only' }, ` ${m.uploadDone}`) : null,
                    ]),
                    file.status === 'uploading'
                      ? h('progress', {
                          class: 'k5-upload__progress',
                          'aria-label': formatMessage(m.uploading, { name: file.name }),
                          value: Math.max(0, Math.min(100, file.progress ?? 0)),
                          max: 100,
                        })
                      : null,
                    file.status === 'error' ? h('span', { class: 'k5-upload__error', role: 'alert' }, file.error ?? m.uploadFailed) : null,
                  ]),
                  file.status === 'success' ? pathIcon(ICON_PATHS.check, 'k5-upload__done') : null,
                  file.status === 'error' && props.retryable
                    ? h(
                        Button,
                        {
                          variant: 'ghost',
                          size: 'sm',
                          disabled: props.disabled,
                          'aria-label': formatMessage(m.retryFile, { name: file.name }),
                          onClick: () => emit('retry', file.id),
                        },
                        { default: () => m.retry },
                      )
                    : null,
                  props.removable
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: 'k5-close',
                          disabled: props.disabled,
                          'aria-label': formatMessage(m.removeFile, { name: file.name }),
                          onClick: () => emit('remove', file.id),
                        },
                        [closeIcon()],
                      )
                    : null,
                ]),
              ),
            )
          : null,
      ])
    }
  },
})
