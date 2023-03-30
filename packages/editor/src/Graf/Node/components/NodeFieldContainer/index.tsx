import { transition } from '@/vars';
import styled from '@emotion/styled';

export const NodeFieldContainer = styled.div<{
  active?: boolean;
  fromInterface?: boolean;
}>`
  /* position: relative; */
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.text.default};
  margin: 0;
  padding: 0.5rem 1rem;
  transition: border-color 0.25s ease-in-out;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.neutral[600] : `${theme.neutral[600]}00`};

  .opener-icon {
    transition: all 0.25s ease-in-out;
    opacity: 0;
  }
  .node-field-port {
    opacity: ${({ active }) => (active ? 1.0 : 0)};
    pointer-events: ${({ active }) => (active ? 'all' : 'none')};
    color: ${({ theme }) => theme.text.disabled};
    transition: ${transition};
    :hover {
      color: ${({ theme }) => theme.text.default};
    }
    .opener-icon {
      opacity: 1;
    }
  }

  :hover {
    border: 1px solid ${({ theme }) => theme.neutral[600]};
    .node-field-port {
      opacity: 1;
      pointer-events: all;
    }
  }
`;
