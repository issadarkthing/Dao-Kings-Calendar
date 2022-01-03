import { client } from "..";

export class Settings {
  id: string;
  eventChannel = "";

  constructor(guildID: string) {
    this.id = guildID;
    const data = client.settings.get(this.id);

    if (data) {
      Object.assign(this, data);
    }
  }

  save() {
    client.settings.set(this.id, this);
  }
}
