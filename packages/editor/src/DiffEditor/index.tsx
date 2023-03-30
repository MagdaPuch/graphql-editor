import { DiffEditorPane } from '@/editor/code';
import styled from '@emotion/styled';
import React, { useState } from 'react';
import { Parser, TreeToGraphQL } from 'graphql-js-tree';
import { useSortState } from '@/state/containers/sort';
import { fontFamilySans } from '@/vars';
import { Arrow_AZ, Select } from '@aexol-studio/styling-system';

interface DiffEditorProps {
  schemas: Record<string, string>;
}

const Main = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  background-color: ${({ theme }) => theme.neutral[600]};
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: row;
  padding: 1rem;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-bottom: 2px solid ${({ theme }) => theme.black};
`;

const Heading = styled.h1`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.disabled};
  font-family: ${fontFamilySans};
`;

const Selects = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 10px;
  right: 16px;
  position: absolute;
  pointer-events: none;
`;

const AZContainer = styled.div<{ active?: boolean }>`
  display: flex;
  cursor: pointer;
  align-items: center;
  color: ${({ theme, active }) =>
    active ? theme.accents[200] : theme.text.disabled};
`;

export const DiffEditor = ({ schemas }: DiffEditorProps) => {
  const { sortAlphabetically } = useSortState();
  const [isSortActive, setIsSortActive] = useState(true);
  const [leftVersion, setLeftVersion] = useState(
    Object.keys(schemas)[Object.keys(schemas).length - 1],
  );
  const [rightVersion, setRightVersion] = useState(
    Object.keys(schemas)[Object.keys(schemas).length - 2],
  );

  const selectOptions = Object.keys(schemas).map((el) => {
    return {
      label: el,
      value: el,
    };
  });

  const sortSchema = (schema: string) => {
    if (!schema) return '';
    const tree = Parser.parse(schema);
    tree.nodes.sort(sortAlphabetically);
    tree.nodes = tree.nodes.filter(
      (n) => n.args?.sort(sortAlphabetically) && n,
    );
    return TreeToGraphQL.parse(tree);
  };

  return (
    <Main>
      <TopBar>
        <Heading>DIFF VIEW</Heading>
        <Selects>
          <Select
            options={selectOptions}
            onChange={setLeftVersion}
            placeholder="Select version..."
            selectedOption={leftVersion}
          />
          <Select
            options={selectOptions}
            onChange={setRightVersion}
            placeholder="Select version..."
            selectedOption={rightVersion}
          />
        </Selects>
        <AZContainer
          active={isSortActive}
          onClick={() => setIsSortActive((s) => !s)}
        >
          <Arrow_AZ />
        </AZContainer>
      </TopBar>
      <DiffEditorPane
        schema={
          isSortActive ? sortSchema(schemas[leftVersion]) : schemas[leftVersion]
        }
        newSchema={
          isSortActive
            ? sortSchema(schemas[rightVersion])
            : schemas[rightVersion]
        }
        size={`100vw-50px`}
      />
    </Main>
  );
};
