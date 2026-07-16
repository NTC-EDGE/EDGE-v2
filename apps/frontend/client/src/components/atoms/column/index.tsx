import React, { ReactNode, FC } from 'react';
import styled from 'styled-components';

const getWidthString = (span: any) => {
  if (!span) return;

  let width = (span / 12) * 100;
  return `width: ${width}%`;
};

const Container = styled.div`
  float: left;
  ${({ xs }: any) => (xs ? getWidthString(xs) : 'width: 100%')}

  @media only screen and (min-width: 768px) {
    ${({ sm }: any) => sm && getWidthString(sm)}
  }

  @media only screen and (min-width: 992px) {
    ${({ md }: any) => md && getWidthString(md)}
  }

  @media only screen and (min-width: 1200px) {
    ${({ lg }: any) => lg && getWidthString(lg)}
  }
`;

interface Props {
  children: ReactNode;
}

const Column: FC<Props> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default Column;
