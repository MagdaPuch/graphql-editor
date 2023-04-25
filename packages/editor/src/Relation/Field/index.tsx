import React from 'react';
import { useTreesState } from '@/state/containers/trees';
import { FieldProps as GrafFieldProps } from '@/Graf/Node/models';
import styled from '@emotion/styled';
import { RELATION_CONSTANTS } from '@/Relation/Lines/constants';
import { TypeSystemDefinition } from 'graphql-js-tree';
import { ActiveFieldName } from '@/Relation/Field/ActiveFieldName';
import { ActiveType } from '@/Relation/Field/ActiveType';

const Main = styled.div<{ isActive?: boolean }>`
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  height: ${RELATION_CONSTANTS.FIELD_HEIGHT}px;
  padding: 0 12px;
  color: ${({ theme }) => theme.text.disabled};
  margin: 0 -12px;
  transition: background-color 0.25s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: ${({ isActive, theme }) =>
      isActive && theme.neutral[500]};
  }
`;

type FieldProps = Pick<GrafFieldProps, 'node'> & {
  active?: boolean;
  showArgs?: boolean;
};

export const Field: React.FC<FieldProps> = ({ node, active }) => {
  const { parentTypes, setSelectedNodeId, getParentOfField } = useTreesState();
  return (
    <Main
      isActive={active}
      onClick={
        active
          ? (e) => {
              const parent = getParentOfField(node);
              if (active && parent) {
                e.stopPropagation();
                setSelectedNodeId({
                  source: 'relation',
                  value: {
                    id: parent.id,
                    name: parent.name,
                  },
                });
              }
            }
          : undefined
      }
    >
      <ActiveFieldName
        name={
          node.data.type !== TypeSystemDefinition.UnionMemberDefinition
            ? node.name
            : ''
        }
        args={node.args}
        parentTypes={parentTypes}
      />
      <ActiveType type={node.type} parentTypes={parentTypes} />
    </Main>
  );
};
