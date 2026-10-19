import axios from "axios";
import sharp from "sharp";

/**
 * Uses the Mojang-API to retrieve a players skin based on the players uuid and returns the skin as a base64 encoded string.
 * @param uuid the uuid of the player
 * @return the skin of the player encoded as a base64-string.
 */
export async function getSkinAsBase64(uuid: string): Promise<string> {
  const response = await axios.get(
    "https://sessionserver.mojang.com/session/minecraft/profile/" + uuid,
  );

  // Fetch profile.
  const data: {
    error?: string;
    properties?: [{ name: string; value: string }];
  } = response.data;

  // Define error prefix.
  const errorMessage: string =
    "Couldn't retrieve skin for uuid " + uuid + ". Reason: ";

  if (data.error) {
    throw new Error(errorMessage + data.error + ": " + JSON.stringify(data));
  }

  if (!data.properties) {
    throw new Error(
      errorMessage + "No properties in response: " + JSON.stringify(data),
    );
  }

  // Loop through properties and find 'textures' property.
  for (const property of data.properties) {
    if (property.name === "textures") {
      // Find object containing the skin URL.
      const response: { textures: { SKIN: { url: string } } } = JSON.parse(
        Buffer.from(property.value, "base64").toString(),
      );

      let skinURL: string;

      // Check if skin URL exists and retrieve it.
      if (
        response.textures &&
        response.textures.SKIN &&
        (skinURL = response.textures.SKIN.url)
      ) {
        // Fetch skin URL and returns as base64.
        const b64 = await axios
          .get(skinURL, { responseType: "arraybuffer" })
          .then((response) => response.data)
          .then((buffer) => {
            return Buffer.from(buffer).toString("base64");
          })
          .catch((error) =>
            console.error(
              errorMessage + "Could not load buffer for URL " + skinURL,
              error,
            ),
          );

        if (b64) return b64;
        else
          throw new Error(errorMessage + "No skin returned for URL " + skinURL);
      } else
        throw new Error(
          errorMessage +
            "No url to skin in response: " +
            JSON.stringify(response),
        );
    }
  }

  throw new Error(
    errorMessage + "No textures object in response: " + JSON.stringify(data),
  );
}

/**
 * Uses the Mojang-API to retrieve a players skin based on the players uuid and returns the extracted face as a base64 encoded string.
 * @param uuid the uuid of the player
 * @return the face of the player encoded as a base64-string.
 */
export async function getFaceAsBase64(uuid: string): Promise<string> {
  const skin = await getSkinAsBase64(uuid);
  const buffer = Buffer.from(skin, "base64");
  const sharpSkin = sharp(buffer);
  const sharpHead = sharpSkin.extract({ left: 8, top: 8, width: 8, height: 8 });
  return sharpHead
    .toBuffer()
    .then((data) => {
      return data.toString("base64");
    })
    .catch((error) => {
      throw new Error(
        "Couldn't extract head of skin for uuid " + uuid + ". Reason: " + error,
      );
    });
}
