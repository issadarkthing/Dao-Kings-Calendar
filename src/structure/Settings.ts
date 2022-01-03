import { client } from "..";


export class Settings {
  id = "a";
  eventChannel = "";

  constructor() {
    const data = client.settings.get(this.id);

    if (data) {
      Object.assign(this, data);
    }
  }

  save() {
    client.settings.set(this.id, this);
  }
}
