import React, { ReactNode, FC } from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  flexdirection: column;
`;

interface Props {
  children: ReactNode;
}

const Column: FC<Props> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default Column;
