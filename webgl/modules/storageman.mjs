export class Storage {
  constructor() {
  }

  //loadData("userData"); //Call saved data load
  saveData(slotName, data) {
    if (!localStorage.getItem(slotName)) localStorage.setItem(slotName, "null");
    let constructedData = {};
    for (item in data) {
      constructedData[item] = item;
      constructedData[item] = data[item].state;
    }
    localStorage.setItem(slotName, JSON.stringify(constructedData));
  }

  loadData(slotName) {
    let loadedData = JSON.parse(localStorage.getItem(slotName));
    for (item in loadedData) {
      dataStorage.modes[item].state = loadedData[item];
    }
  }
}
