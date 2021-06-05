import BufferLayout from 'buffer-layout'

export default class DataLayouts {
  static get () {
    const dataLayouts = []

    /* >>>>>>>>>>>>>>>>>>>>>>>>>>> EXAMPLES: HELLO DEV  <<<<<<<<<<<<<<<<<<<<<<<<<< */
    dataLayouts.push({
      name: 'counter',
      layout: BufferLayout.struct([BufferLayout.u32('sampleCounter')])
    }
    )

    return dataLayouts
  }
}
