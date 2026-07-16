import React, { FC } from 'react'
import { ArrowLeft as LucideArrowLeft } from 'lucide-react-native'
import { RNValue as RFValue } from '@utils/formatting'

interface Props {
  type?: string
  size?: number
  color?: string
  [x: string]: any
}

const ArrowLeft: FC<Props> = ({
                                type = '',
                                size = 24,
                                color = '#000',
                                ...otherProps
                              }) => {
  return (
      <LucideArrowLeft
          size={RFValue(size)}
          color={color}
          strokeWidth={2}      // keeps Lucide crisp outline style
          {...otherProps}
      />
  )
}

export default React.memo(ArrowLeft)
