import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { LocalizedInput } from '@opiumteam/react-opium-components'

export enum EFieldType {
  NUMBER = 'NUMBER',
  SEGMENT = 'SEGMENT',
  SELECT = 'SELECT'
}

type Props = {
  onChange: Function
  value?: number
}



const Input: FC<Props> = (props: Props) => {

  return (
    <LocalizedInput
      type={EFieldType.NUMBER}
      label="Amount:"
      onClick={() => { }}
      onChange={props.onChange}
      placeholder={'Enter amount'}
    />
  )
}

export default observer(Input)
