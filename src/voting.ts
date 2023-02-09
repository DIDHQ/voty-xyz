import { uniq, without } from 'lodash-es'

export function updateChoice(
  type: 'single' | 'multiple',
  choice: string,
  option: string,
): string {
  try {
    if (type === 'single') {
      return JSON.stringify(option)
    }
    if (type === 'multiple') {
      const array = JSON.parse(choice || '[]') as string[]
      return JSON.stringify(
        array.includes(option)
          ? without(array, option)
          : uniq([...array, option]),
      )
    }
    return ''
  } catch (err) {
    console.error('updateChoice', err)
    return ''
  }
}

export function checkChoice(
  type: 'single' | 'multiple',
  choice: string,
  option: string,
): boolean {
  try {
    if (type === 'single') {
      return JSON.parse(choice) === option
    }
    if (type === 'multiple') {
      return (JSON.parse(choice || '[]') as string[]).includes(option)
    }
    return false
  } catch (err) {
    console.error('checkChoice', err)
    return false
  }
}

export function powerOfChoice(
  type: 'single' | 'multiple',
  choice: string,
  power: number,
): { [option: string]: number | undefined } {
  try {
    if (type === 'single') {
      return { [JSON.parse(choice)]: power }
    }
    if (type === 'multiple') {
      const array = JSON.parse(choice || '[]') as string[]
      return array.reduce((obj, option) => {
        obj[option] = power / array.length
        return obj
      }, {} as { [option: string]: number })
    }
    return {}
  } catch (err) {
    console.error('powerOfChoice', err)
    return {}
  }
}
