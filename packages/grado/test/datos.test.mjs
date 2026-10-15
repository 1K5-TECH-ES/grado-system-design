// Grupo «datos y piezas»: cada clase que generan los helpers existe en grado.css.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  avatarGroupClass,
  copyButtonClass,
  descriptionListClass,
  linkClass,
  progressClass,
  separatorClass,
  statusClass,
  tagClass,
  PROGRESS_TONES,
  STATUS_TONES,
} from '../src/classes.js'

const css = readFileSync(new URL('../dist/grado.css', import.meta.url), 'utf8')
const classes = (value) => value.split(' ').filter(Boolean)

test('las clases del grupo datos existen en grado.css', () => {
  const generated = [
    ...STATUS_TONES.flatMap((tone) => [statusClass({ tone }), statusClass({ tone, pulse: true })]),
    ...PROGRESS_TONES.map((tone) => progressClass({ tone, size: 'sm', indeterminate: true, steps: true })),
    descriptionListClass({ layout: 'stacked' }),
    copyButtonClass({ size: 'md', iconOnly: true, copied: true }),
    tagClass({ size: 'sm', disabled: true }),
    avatarGroupClass({ size: 'sm' }),
    avatarGroupClass({ size: 'lg' }),
    separatorClass({ orientation: 'vertical', label: true }),
    linkClass({ tone: 'muted', underline: 'always' }),
    'k5-status__dot k5-progress__head k5-progress__label k5-progress__value k5-progress__track k5-progress__bar',
    'k5-progress__step k5-progress__step--done k5-dl__item k5-dl__term k5-dl__description k5-dl__description--mono k5-dl__value',
    'k5-copy k5-tag__label k5-tag__remove k5-avatar-group__more k5-avatar__image k5-kbd k5-kbd__key k5-separator__label k5-link__icon',
  ].flatMap(classes)
  for (const name of new Set(generated)) assert.ok(css.includes(`.${name}`), `falta .${name} en grado.css`)
})

test('los helpers aceptan solo valores conocidos', () => {
  assert.equal(statusClass({ tone: 'raro' }), 'k5-status k5-status--neutral')
  assert.equal(progressClass({ tone: 'info', size: 'lg' }), 'k5-progress k5-progress--brand')
  assert.equal(descriptionListClass({ layout: 'grid' }), 'k5-dl')
  assert.equal(linkClass({ tone: 'brand', underline: 'never' }), 'k5-link')
  assert.equal(copyButtonClass(), 'k5-btn k5-btn--ghost k5-btn--sm k5-copy__button')
})
