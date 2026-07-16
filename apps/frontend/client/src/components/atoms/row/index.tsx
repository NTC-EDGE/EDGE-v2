import React, { ReactNode, FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  &::after {
    content: '';
    clear: both;
    display: table;
  }
`;

interface Props {
  children: ReactNode;
  style?: any;
}

const Row: FC<Props> = ({ children, style }) => {
  return <Container style={style}>{children}</Container>;
};

export default Row;
