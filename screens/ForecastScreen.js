import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const data = [
  {
    area: "Modera",
    2013: "1.41%",
    2014: "1.44%",
    2015: "1.02%",
    2016: "0.91%",
    2017: "0.56%",
    2018: "0.42%",
    2019: "0.64%",
  },
  {
    area: "Grandpass",
    2013: "3.84%",
    2014: "3.75%",
    2015: "2.97%",
    2016: "3.44%",
    2017: "4.01%",
    2018: "4.33%",
    2019: "4.89%",
  },
  {
    area: "Kotahena",
    2013: "2.03%",
    2014: "1.92%",
    2015: "2.05%",
    2016: "2.43%",
    2017: "1.76%",
    2018: "1.54%",
    2019: "1.66%",
  },
  {
    area: "Dematagoda",
    2013: "1.49%",
    2014: "1.77%",
    2015: "1.49%",
    2016: "1.18%",
    2017: "0.96%",
    2018: "1.15%",
    2019: "2.08%",
  },
  {
    area: "Borella",
    2013: "5.23%",
    2014: "5.59%",
    2015: "5.65%",
    2016: "5.44%",
    2017: "4.10%",
    2018: "5.79%",
    2019: "5.50%",
  },
  {
    area: "Welikada",
    2013: "2.76%",
    2014: "3.19%",
    2015: "3.12%",
    2016: "2.74%",
    2017: "2.63%",
    2018: "3.02%",
    2019: "3.13%",
  },
  {
    area: "Cinnamon Gardens",
    2013: "3.97%",
    2014: "3.99%",
    2015: "4.19%",
    2016: "4.49%",
    2017: "4.02%",
    2018: "4.37%",
    2019: "4.56%",
  },
  {
    area: "Narahenpita",
    2013: "1.87%",
    2014: "1.97%",
    2015: "2.12%",
    2016: "2.36%",
    2017: "2.00%",
    2018: "2.13%",
    2019: "2.10%",
  },
  {
    area: "Kirulapone",
    2013: "2.67%",
    2014: "2.72%",
    2015: "2.69%",
    2016: "2.57%",
    2017: "2.18%",
    2018: "2.29%",
    2019: "2.56%",
  },
  {
    area: "Wellawatta",
    2013: "2.83%",
    2014: "2.77%",
    2015: "2.68%",
    2016: "2.44%",
    2017: "2.22%",
    2018: "2.45%",
    2019: "2.50%",
  },
  {
    area: "Bambalapitiya",
    2013: "2.42%",
    2014: "2.58%",
    2015: "2.67%",
    2016: "2.80%",
    2017: "2.38%",
    2018: "2.55%",
    2019: "2.32%",
  },
  {
    area: "Kollupitiya",
    2013: "2.56%",
    2014: "2.45%",
    2015: "2.32%",
    2016: "2.29%",
    2017: "1.94%",
    2018: "1.91%",
    2019: "1.87%",
  },
  {
    area: "Fort",
    2013: "1.36%",
    2014: "1.22%",
    2015: "1.24%",
    2016: "1.40%",
    2017: "1.40%",
    2018: "1.20%",
    2019: "1.13%",
  },
  {
    area: "Slave Island",
    2013: "2.29%",
    2014: "2.40%",
    2015: "2.30%",
    2016: "2.29%",
    2017: "2.03%",
    2018: "1.93%",
    2019: "1.85%",
  },
  {
    area: "Harbour",
    2013: "0.63%",
    2014: "0.55%",
    2015: "0.43%",
    2016: "0.39%",
    2017: "0.36%",
    2018: "0.27%",
    2019: "0.36%",
  },
  {
    area: "Pettah",
    2013: "1.44%",
    2014: "1.24%",
    2015: "1.07%",
    2016: "1.07%",
    2017: "1.10%",
    2018: "0.88%",
    2019: "0.83%",
  },
  {
    area: "Maligawatta",
    2013: "1.85%",
    2014: "1.96%",
    2015: "1.87%",
    2016: "1.92%",
    2017: "1.63%",
    2018: "1.77%",
    2019: "1.61%",
  },
  {
    area: "Maradana",
    2013: "2.02%",
    2014: "1.90%",
    2015: "2.10%",
    2016: "2.08%",
    2017: "1.66%",
    2018: "1.86%",
    2019: "1.69%",
  },
];

export default function ForecastScreen() {
  const [selectedYear, setSelectedYear] = useState("2019");
  const [searchText, setSearchText] = useState("");
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(
    data.find((item) => item.area === "Fort")
  ); // Default to "Fort"

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const matches = data.filter((item) =>
        item.area.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredAreas(matches.slice(0, 4)); // Show top 4 matches
    } else {
      setFilteredAreas([]);
    }
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setSearchText(area.area);
    setFilteredAreas([]);
  };

  const calculateHighMidLow = () => {
    const values = data.map((item) => parseFloat(item[selectedYear]));
    const high = Math.max(...values);
    const low = Math.min(...values);
    const mid = (high + low) / 2;
    return { high, mid, low };
  };

  const { high, mid, low } = calculateHighMidLow();

  const getIndicator = () => {
    if (!selectedArea) return null;
    const value = parseFloat(selectedArea[selectedYear]);
    if (value === high) {
      return { label: "High", value: `${value.toFixed(2)}%`, color: "#ff6060" };
    } else if (value === low) {
      return { label: "Low", value: `${value.toFixed(2)}%`, color: "#8b9dff" };
    } else if (value > low && value < high) {
      return { label: "Mid", value: `${value.toFixed(2)}%`, color: "#ffd700" };
    }
    return null;
  };

  const indicator = getIndicator();

  const chartData = selectedArea
    ? [
        {
          name: `% ${selectedArea.area}`,
          population: parseFloat(selectedArea[selectedYear]),
          color: "#ff7474",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
        {
          name: "% Others",
          population: 100 - parseFloat(selectedArea[selectedYear]),
          color: "#3f8fff",
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accident Forecast</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Police Area"
        value={searchText}
        onChangeText={handleSearch}
      />
      {filteredAreas.length > 0 && (
        <View style={styles.dropdown}>
          {filteredAreas.map((area) => (
            <TouchableOpacity
              key={area.area}
              style={styles.dropdownItem}
              onPress={() => handleSelectArea(area)}
            >
              <Text>{area.area}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <Picker
        selectedValue={selectedYear}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedYear(itemValue)}
      >
        <Picker.Item label="2013" value="2013" />
        <Picker.Item label="2014" value="2014" />
        <Picker.Item label="2015" value="2015" />
        <Picker.Item label="2016" value="2016" />
        <Picker.Item label="2017" value="2017" />
        <Picker.Item label="2018" value="2018" />
        <Picker.Item label="2019" value="2019" />
      </Picker>
      {selectedArea && (
        <>
          <Text style={styles.selectedCity}>
            Selected City: {selectedArea.area}
          </Text>
          <PieChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
          />
          {indicator && (
            <View style={styles.horizontalBar}>
              <Text style={styles.averageText}>
                Average accident in this area -
              </Text>
              <View
                style={[
                  styles.barSegment,
                  {
                    backgroundColor: indicator.color,
                  },
                ]}
              >
                <Text style={styles.barValue}>{indicator.label}</Text>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 16,
  },
  selectedCity: {
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",

    marginBottom: 56,
  },
  horizontalBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 46,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 8,
  },
  barSegment: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 100,
    borderRadius: 8, // Added border radius for curve
  },
  barLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  barValue: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#fff",
  },
  averageText: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#333",
  },
});
