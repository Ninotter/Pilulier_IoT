import React, { useState } from "react";
import { View, TouchableOpacity, FlatList, StyleSheet, Text } from "react-native";

const Grid = () => {
  const rows = 3;
  const cols = 7;
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const [grid, setGrid] = useState(Array(rows * cols).fill(false));

  const toggleCell = (index: number) => {
    const newGrid = [...grid];
    newGrid[index] = !newGrid[index];
    setGrid(newGrid);
  };

  const renderItem = ({ item, index }: { item: boolean; index: number }) => (
    <TouchableOpacity
      style={[styles.cell, item ? styles.cellActive : styles.cellInactive]}
      onPress={() => toggleCell(index)}
    >
      <Text style={styles.cellText}>{item ? "ON" : "OFF"}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {daysOfWeek.map((day, index) => (
        <View key={index} style={styles.headerCell}>
          <Text style={styles.headerText}>{day}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        style={styles.flatList}
        data={grid}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        numColumns={cols}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  cell: {
    width: 30,
    height: 30,
    margin: 4,
    marginStart: 12,
    marginEnd: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 80,
  },
  cellInactive: {
    backgroundColor: "gray",
  },
  cellActive: {
    backgroundColor: "blue",
  },
  cellText: {
    color: "white",
  },
  flatList: {
    flexGrow: 0
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
  },
});

export default Grid;
