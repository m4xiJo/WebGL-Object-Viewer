export class Memory {
  constructor(config) {
  }

  saveData(slotName, data) {
    if (!localStorage.getItem(slotName)) localStorage.setItem(slotName, "null");
    let constructedData = {};
    for (let item in data) {
      constructedData[item] = item;
      constructedData[item] = data[item].currstate;
    }
    localStorage.setItem(slotName, JSON.stringify(constructedData));
  }

  loadData(slotName, data) {
    let loadedData = JSON.parse(localStorage.getItem(slotName));
    for (let item in loadedData) {
      data.modes[item].currstate = loadedData[item];
    }
    return(data);
  }
}
