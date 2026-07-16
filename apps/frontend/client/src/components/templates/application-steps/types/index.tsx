import React, {FC, useCallback, useMemo} from 'react';
import {View, FlatList, TouchableOpacity, Linking} from 'react-native';
import Text from '@atoms/text';
import CheckBox from '@molecules/checkbox';
import { DropdownField } from '@molecules/form-fields';
import styles from './styles';

interface Props {
  types?: any;
  examineeType?: any;
  entityTypes?: any;
  entityType?: any;
  examineesType?: any;
  applicationType?: any;
  onChangeEntityTypeValue?: any;
  onChangeValue?: any;
  onChangeExamineeTypeValue: any;
  onSelect?: any;
  region?: any;
}

// Extracted Static Separator to avoid re-renders
const RenderSeparator = React.memo(() => <View style={styles.separator} />);

// Extracted ElementItem to avoid re-creating component types inside the main list.
const ElementItem = React.memo(({ item, isChecked, onSelect }: any) => {
  return (
    <View style={styles.row}>
      <CheckBox
        type='circle'
        style={styles.checkbox}
        isChecked={isChecked}
        onClick={() => onSelect(item)}
        label={item}
      />
    </View>
  );
});

// Extracted RequirementItem to avoid re-creating component types inside the nested list.
const RequirementItem = React.memo(({ item, index, region }: any) => {
  const include = ["VII"].includes(region);
  if (include) {
    const isRequired =
      item?.required ||
      (item?.additional &&
        item?.additional?.[region]?.required === true);
    return (
      <View>
        <Text>{index + 1}. {item?.title}{isRequired && <Text style={styles?.requiredText}>*</Text>}</Text>

        {
          !!item?.description &&
          <Text style={styles?.reqDesc}>{item?.description}</Text>
        }
        {
          !!item?.link && (
            <TouchableOpacity onPress={() => Linking.openURL(item?.link)}>
              <Text style={[styles?.reqDesc, { color: "blue", textDecorationLine: "underline" }]}>
                [⬇ Download Form]
              </Text>
            </TouchableOpacity>
          )
        }
      </View>
    );
  }

  return (
    <View>
      <Text>{index + 1}. {item?.title}{item?.required && <Text style={styles?.requiredText}>*</Text>}</Text>

      {
        !!item?.description &&
        <Text style={styles?.reqDesc}>{item?.description}</Text>
      }

    </View>
  );
});

// Extracted RequirementsSection to avoid re-creating the requirements list structure.
const RequirementsSection = React.memo(({
  requirements,
  renderRequirement,
  keyExtractor,
  hasElements,
}: any) => {
  const ListHeader = useCallback(() => (
    <View style={hasElements ? styles?.reqHeaderView : styles?.reqHeaderView2}>
      <Text style={styles?.reqHeaderTitle}>Requirements</Text>
    </View>
  ), [hasElements]);

  const ListEmpty = useCallback(() => (
    <View>
      <Text style={[styles?.reqDesc, styles?.reqEmptyText]}>No requirements to be listed.</Text>
    </View>
  ), []);

  const ListFooter = useCallback(() => <View style={styles?.footer} />, []);

  return (
    <FlatList
      showsVerticalScrollIndicator={true}
      data={requirements}
      renderItem={renderRequirement}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      ItemSeparatorComponent={RenderSeparator}
      // Performance props
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
});

const Types: FC<Props> = ({
  types = [],
  examineesType = [],
  region = null,
  entityTypes = [],
  examineeType = {label: ""},
  entityType = {label: ""},
  applicationType = {},
  onChangeValue = () => {},
  onChangeExamineeTypeValue = () => {},
  onChangeEntityTypeValue = () => {},
  onSelect = () => {},
}) => {
  const { label, elements, element, requirements, formCode } = applicationType;
  const { label: examineeTypeLabel, requirements: examineeTypeRequirements } = examineeType;
  const { label: entityTypeLabel, requirements: entityTypeRequirements } = entityType;

  const typesMemo = useMemo(() => {
    if (region === "IV-A") {
      return types.filter((t: any) => {
        return !(t.label === "Permit to PURCHASE" ||
          t.label === "Permit to POSSESS" ||
          t.label === "Amateur Radio Station Permit to PURCHASE" ||
          t.label === "Amateur Radio Station Permit to POSSESS" ||
          t.label === "Ship Station Permit to POSSESS (DOMESTIC Trade)" ||
          t.label === "Ship Station Permit to PURCHASE (DOMESTIC Trade)");
      });
    }
    return types;
  }, [region, types]);

  const renderItem = useCallback(({ item }: any) => (
    <ElementItem
      item={item}
      isChecked={element === item}
      onSelect={onSelect}
    />
  ), [element, onSelect]);

  const renderRequirement = useCallback(({ item, index }: any) => (
    <RequirementItem
      item={item}
      index={index}
      region={region}
    />
  ), [region]);

  const keyExtractor = useCallback((_: any, index: number) => `${index}`, []);

  const requirementsData = useMemo(() => {
    const hasSpecialType = examineeTypeLabel || (entityTypeLabel && formCode === "ntc1-09-GOVTPVT-pur-pos");
    if (!hasSpecialType) return requirements;

    return examineeTypeRequirements?.length > 0 && examineeType?.label !== "First Taker"
      ? examineeTypeRequirements
      : entityTypeRequirements?.length > 0
        ? entityTypeRequirements
        : requirements;
  }, [examineeTypeLabel, entityTypeLabel, formCode, examineeTypeRequirements, examineeType?.label, entityTypeRequirements, requirements]);

  const ListHeader = useCallback(() => (
    <>
      <DropdownField
        items={typesMemo}
        placeholder='Application type'
        value={label}
        onChangeValue={onChangeValue}
      />
      {
        examineesType?.length > 0 ? <DropdownField
          items={examineesType}
          placeholder='Examinee type'
          value={examineeTypeLabel}
          onChangeValue={onChangeExamineeTypeValue}
        /> : null
      }
      {
        entityTypes?.length > 0 && formCode === "ntc1-09-GOVTPVT-pur-pos" ? <DropdownField
          items={entityTypes}
          placeholder='Entity Types'
          value={entityTypeLabel}
          onChangeValue={onChangeEntityTypeValue}
        /> : null
      }
    </>
  ), [typesMemo, label, onChangeValue, examineesType, examineeTypeLabel, onChangeExamineeTypeValue, entityTypes, formCode, entityTypeLabel, onChangeEntityTypeValue]);

  const ListFooter = useCallback(() => (
    <RequirementsSection
      requirements={requirementsData}
      renderRequirement={renderRequirement}
      keyExtractor={keyExtractor}
      hasElements={elements?.length > 0}
    />
  ), [requirementsData, renderRequirement, keyExtractor, elements?.length]);

  return (
    <FlatList
      style={styles.container}
      showsVerticalScrollIndicator={true}
      data={elements}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={RenderSeparator}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      // Performance props
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};

export default React.memo(Types);
