import React, { useEffect, useState } from 'react';
import {
  TypeDefinition,
  ValueDefinition,
  ParserField,
  TypeSystemDefinition,
  Instances,
  Options,
  compileType,
} from 'graphql-js-tree';
import {
  MenuScrollingArea,
  DetailMenuItem,
  Menu,
} from '@/Graf/Node/components';
import { More, Monkey, Plus, Tick } from '@/shared/icons';
import {
  NodeAddDirectiveMenu,
  NodeDirectiveOptionsMenu,
  NodeAddFieldMenu,
  NodeOperationsMenu,
} from '@/shared/components/ContextMenu';
import { useTreesState } from '@/state/containers/trees';

import { useTheme } from '@/state/containers';
import { getScalarFields } from '@/Graf/utils/getScalarFields';
import styled from '@emotion/styled';

type PossibleMenus =
  | 'field'
  | 'interface'
  | 'directive'
  | 'options'
  | 'operations';

const NodeMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  transform: translate(calc(50% + 7px), calc(50% + 21px));
`;

const NodeIconArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  width: 24px;
  height: 24px;
  transition: background-color 0.25s ease-in-out;
  background-color: transparent;
  cursor: pointer;
  border-radius: 12px;
  &:hover {
    background-color: ${({ theme }) => theme.background.mainFurthest};
  }
`;

const ICON_SIZE = 14;
export const TopNodeMenu: React.FC<{
  node: ParserField;
  onDelete: () => void;
  onDuplicate?: () => void;
  onInputCreate?: () => void;
}> = ({ node, onDelete, onDuplicate, onInputCreate }) => {
  const { scalars, tree, setTree } = useTreesState();
  const { theme } = useTheme();

  const [menuOpen, setMenuOpen] = useState<PossibleMenus>();
  const [closeMenu, setCloseMenu] = useState(false);

  const isCreateInputValid = () =>
    getScalarFields(node, scalars)?.length > 0 &&
    node.data.type === 'ObjectTypeDefinition';

  const isRequiredMenuValid = () =>
    node.data.type === TypeDefinition.InterfaceTypeDefinition ||
    node.data.type === TypeDefinition.InputObjectTypeDefinition ||
    (node.data.type === TypeDefinition.ObjectTypeDefinition &&
      (node.interfaces?.length === 0 ||
        (!node.interfaces && !!node.args?.length)));

  useEffect(() => {
    hideMenu();
  }, [closeMenu]);

  useEffect(() => {
    if (
      node.args.length === 0 &&
      node.data.type !== TypeDefinition.ScalarTypeDefinition &&
      node.data.type !== TypeSystemDefinition.DirectiveDefinition
    ) {
      setMenuOpen('field');
    }
  }, [node.args.length, node.data.type]);

  const hideMenu = () => {
    setMenuOpen(undefined);
  };

  return (
    <>
      {node.data.type !== TypeDefinition.ScalarTypeDefinition &&
        node.data.type !== ValueDefinition.EnumValueDefinition && (
          <NodeIconArea
            onClick={() => {
              setMenuOpen('field');
            }}
            title="Click to add field"
          >
            <Plus
              fill={menuOpen === 'field' ? theme.active : theme.text}
              height={ICON_SIZE}
              width={ICON_SIZE}
            />
            {menuOpen === 'field' && (
              <NodeMenuContainer>
                <NodeAddFieldMenu node={node} hideMenu={hideMenu} />
              </NodeMenuContainer>
            )}
          </NodeIconArea>
        )}

      {node.data.type !== Instances.Directive && (
        <NodeIconArea
          onClick={() => {
            setMenuOpen('directive');
          }}
          title="Click to add directive"
        >
          <Monkey
            fill={menuOpen === 'directive' ? theme.active : theme.text}
            height={ICON_SIZE}
            width={ICON_SIZE}
          />
          {menuOpen === 'directive' &&
            node.data.type !== TypeSystemDefinition.DirectiveDefinition && (
              <NodeMenuContainer>
                <NodeAddDirectiveMenu node={node} hideMenu={hideMenu} />
              </NodeMenuContainer>
            )}
          {menuOpen === 'directive' &&
            node.data.type === TypeSystemDefinition.DirectiveDefinition && (
              <NodeMenuContainer>
                <NodeDirectiveOptionsMenu node={node} hideMenu={hideMenu} />
              </NodeMenuContainer>
            )}
        </NodeIconArea>
      )}
      {node.data.type === TypeDefinition.ObjectTypeDefinition && (
        <>
          {/* TODO: Implement operations menu */}
          <NodeIconArea
            onClick={() => {
              setMenuOpen('operations');
            }}
            title="Click set schema query, mutation, subscription"
          >
            <Tick
              height={ICON_SIZE}
              width={ICON_SIZE}
              fill={menuOpen === 'operations' ? theme.active : theme.text}
            />
            {menuOpen === 'operations' && (
              <NodeMenuContainer>
                <NodeOperationsMenu node={node} hideMenu={hideMenu} />
              </NodeMenuContainer>
            )}
          </NodeIconArea>
        </>
      )}
      <NodeIconArea
        onClick={() => {
          setMenuOpen('options');
        }}
        title="Click to see node actions"
      >
        <More
          fill={menuOpen === 'options' ? theme.active : theme.text}
          height={ICON_SIZE}
          width={ICON_SIZE}
        />
        {menuOpen === 'options' && (
          <NodeMenuContainer>
            <Menu menuName={'Node options'} hideMenu={hideMenu}>
              <MenuScrollingArea>
                <DetailMenuItem onClick={onDelete}>Delete node</DetailMenuItem>
                {onDuplicate && (
                  <DetailMenuItem
                    onClick={() => {
                      setCloseMenu((prevValue) => !prevValue);
                      onDuplicate();
                    }}
                  >
                    Duplicate node
                  </DetailMenuItem>
                )}
                {onInputCreate && isCreateInputValid() && (
                  <DetailMenuItem
                    onClick={() => {
                      setCloseMenu((prevValue) => !prevValue);
                      onInputCreate();
                    }}
                  >
                    Create input from node
                  </DetailMenuItem>
                )}
                {isRequiredMenuValid() && (
                  <>
                    <DetailMenuItem
                      onClick={() => {
                        node.args?.forEach((arg) => {
                          if (arg.type.fieldType.type === Options.required) {
                            arg.type.fieldType = {
                              ...arg.type.fieldType.nest,
                            };
                          }
                        });
                        const idx = tree.nodes.findIndex(
                          (n) => n.name === node.name,
                        );
                        tree.nodes.splice(idx, 1, node);
                        setTree({ nodes: tree.nodes }, false);
                      }}
                    >
                      Make all fields optional
                    </DetailMenuItem>
                    <DetailMenuItem
                      onClick={() => {
                        node.args?.forEach((arg) => {
                          const argType = compileType(arg.type.fieldType);
                          if (!argType.endsWith('!')) {
                            arg.type.fieldType = {
                              type: Options.required,
                              nest: arg.type.fieldType,
                            };
                          }
                        });

                        const idx = tree.nodes.findIndex(
                          (n) => n.name === node.name,
                        );
                        tree.nodes.splice(idx, 1, node);
                        setTree({ nodes: tree.nodes }, false);
                      }}
                    >
                      Make all fields required
                    </DetailMenuItem>
                  </>
                )}
              </MenuScrollingArea>
            </Menu>
          </NodeMenuContainer>
        )}
      </NodeIconArea>
    </>
  );
};
