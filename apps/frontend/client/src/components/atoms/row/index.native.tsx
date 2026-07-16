import React, { ReactNode, FC } from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  flexdirection: row;
`;

interface Props {
  children: ReactNode;
}

const Row: FC<Props> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default React.memo(Row);
