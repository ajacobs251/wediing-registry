import "server-only";

import { createHash } from "node:crypto";

const lookupTokenReplacements: Record<string, string> = {
  alabama: "al",
  apartment: "unit",
  apt: "unit",
  avenue: "ave",
  circle: "cir",
  drive: "dr",
  east: "e",
  florida: "fl",
  mississippi: "ms",
  north: "n",
  ohio: "oh",
  road: "rd",
  south: "s",
  ste: "unit",
  street: "st",
  suite: "unit",
  tennessee: "tn",
  virginia: "va",
  west: "w",
};

// The source list is stored as one-way hashes so guest names and addresses are
// not published in plaintext in the public repository.
const invitationLookupHashes = new Set([
  "081cc29eb423365c958c2dedc759a274f55d4f95ab2e89c5c826e19650efddb0",
  "0c32037849ee03bc92e4cbb62e44200a3495bebd5b614cd49380832d860a0e86",
  "10d70650d0c80917bdfd04aea9670ea5b9a36006ccc67c29255dee7d5b696bb1",
  "159fcbf7252ca7e88022db2a7839db904a4b9fc6a7cbd7f07e1f06a7a52b14b5",
  "1ac49f761c640404450592baab2a5fc9213ab67699e9ed77022d96336f52a3e8",
  "1c37b68fb890e5f0a2c2d737eea69c26e536b878d0fb9e274816c2ad928ea96d",
  "2630b0e80a9c5ca241708933d21112e54a8aafa2732c57f8a897156326749277",
  "2c7b64ea64f606b38d9abb21cf65db5ba3363c5d141a522d24190da70da15b89",
  "32ce53f7acfe4f4866c370d63aa3e562ad4cda269b3be3e7399cf92a372821d6",
  "3937d71ed7b3e34c1cdaa3ecbc3c5e0ab63d498640443a04be61b50bbcd0c483",
  "3bb3ca6d77a1e41c3605477c27b3d2b685fcef7f9ac2ab5c7d14d76d38786c11",
  "3c64ca2ac0a4b95aa79916f6b82b7606a051efcb3cc5f2c6937ad85995463672",
  "3e6f4ad70214e3202bb7fbb6b453f61a0414d0cc39531a1b5ed26682176d3cc3",
  "3fd1e461f53a299cc9240ff4a7615ff9a271340e3f19abe8bf2e61a1007fd266",
  "449e253eaf2c0510fd923c93cff5e902cc96236cd31c0c1aebe17ec6f4f73f8f",
  "45ed4cd783db8d285d377906590e0f4b0dc26474cc0e03e827a2fe3a5c324d57",
  "4b2d1bd474e841be00d4d3fc0aa02df7db88a7c19f6497536e26482b0f0b14b9",
  "4c5147911bcfc45050f79ec23d7a9aedc483b2e867f5060f265fb8b814eff1ce",
  "4c9840774e17315d54ad9b469c4a920559f3c1a4ea99ea4225117a752036ea93",
  "51ecfb07343876bc7d5ae5423c734f0d556384686539ffe17dab9183dd3e9a1a",
  "55939c8c89f8e378667848c4e9ed53d26842dd5105834c3ec3b98dd7ed92ef96",
  "58cc6181518fbfb49da9c50db08ce31aa92feebaecc6c46a3a8084e87b50f037",
  "59d538ef37faab7ee5dd72e5c49ee65e3373d6a2370696443ccab0873476671a",
  "5a59c654f7254db628594dc30db6d5f1b3c87b638782114620590c30ee697b2e",
  "5db2019ea4cc1aec0095bf7f10b3e5d192d9d128a5ef328f8af99e4e9db743fd",
  "625d9aaaf901fc044e60da7a0316b80a79462b574e7d045d2d5cdfc59b1938e1",
  "629d0a1553aa8bd5583c184539ba8df179bf33b96c0fd743bdac18433e2bb06e",
  "62e096c6edd4d1e629702533a5da6577b02343bfb4b3163f6224fa3341c22e13",
  "64099f8a330447aecb85d164dea96612d71e1e26ca03486230ad871c82c0150c",
  "69e427a22aba1f73fdc533bec39de9b3763241c1bf9f775199326a6cf0275667",
  "69f29ad67aeda4bc5937170d919ecde00939ba0fc1ade65de037d0372a0be2a8",
  "6f52178d248d4d386fdcbf0139fd95627daf82a4ccc71f6a93b58375d63502dc",
  "7237e688e7c10f49fb6b1c499acbce24b9b6269e83f248e13608c23c390abb6a",
  "7a9fe3c8aedbbae1d1ec65b40a1a4490f48cea34afe93d240928d4e9d25164a5",
  "7dc0c8cebca54b5a2edf68e92b767e3c64a2a44f29f18a6891e6cbaf2e69f35a",
  "87594bc39153e11775116fcaa8bd80634d643edb1e80b6506d7d198af4ad300c",
  "905c4671f5d72f75f9fd82f8e5322d324299dd4fe047e80f6ca3d574d93c89c6",
  "90e363c6869d7791aa8e0a728e9eef98254eec05d661d47c26fe3b73de7a24ae",
  "924d1f3a1a1eb419f21aa7c05d61cb48c05b539643b76d93224e0129551c8b9b",
  "9af924ef2bb91418a4683f207b1cf26e3fa4ccdf741a1e74b9e2a8b3e021f055",
  "9b8c4363767275e9954a26d33f27770d6e38156fe915c539899ed666be9a9030",
  "a3ff5af530d4b8108bbec8679bfe1986321807bcc25bb9e13b87fa55bb38c97b",
  "ae405bc8cbe08bee45596c16ca65e8b54beceb20932032c871654d080c58f6bb",
  "ae9ad33e54f35abc9687bb6a85527f5371121b27e2f88296b7c7648e46bed72b",
  "aed8792fcc0624d61414e729c44cb32c45095c6d66112b6e24738b7a9afb170d",
  "aff839993739b0787c54dddd95f43b7fd81364d5f8218467c77cbd2a3194c340",
  "b011211e0d245b7d3be9c22fcd302dff0a9cfe782d8f19b703a7bc2c73fc5c52",
  "b074b40b9a208e177d7e067ecc0dc4bc590be549cba1e92bcb1773dc465f480c",
  "b52d0939a033f0d38c0d1235fc603a390290d187ba01c13489dcd65a51245e14",
  "c1916d7e9c65a098dba62c5084a90c770c8b8c6b92bbe0fd4cfd014ae5da58c6",
  "c309a86f7f50b7ed1963f0e1af83f60c1d2bbaec4caf1cd34ec66a74dde04ddb",
  "c49b876c05fd376922883ceaf5b7e7871ae4ae9f24e79958f3fc70efe114627d",
  "cb9cf086895fb26fb9f55de21f501636af9f4587fce1df254d53477e7611ad5c",
  "d83ec8f1544abe2ccf0f6ff3e728c94b163593c9cef08aa112e49de07cf5720a",
  "dc396e6533a33201ea8f822af8fbd9b3401f11a40196bd0e3e605ed123b00857",
  "e2b3e4d20980eba7ec3c8301e912a726b2605818b6b8fa6258a176cdce08b6e0",
  "e8e17e100934ec91924373411814f7266644cbbfa7a6b01f2337ac1404164295",
  "e9588fc6978c67a22911c5c7ed1194ac173bc8d34f87f7d5778ca1ee0270455f",
  "ec7e572d876c39c96b6dd3ce61ec7e64cbcaff9bb4df0d0819e23c05f92630d8",
  "ec809ff6db919129fa02d8ca609241ac8246f57579d7bc35813dcee1a2c99db0",
  "ef973bad4f5103aa30de967d08975b5150f17f1cc3b3f71a695b92a336311288",
  "f122ed4be93a5b8c97b7d127a6504c1d6929b7fb1a43b652891afe2da4db5b3b",
  "f44080d484cb63c8b4f755041e1441c7254105cf47ef5864a5e94aa598da8f38",
  "f713ff18b8a13fa7a8e15983e3c3e7728aaf78ee488846a94d5d616ead56f36f",
  "f99ca9f06226365b57abb3b7a0db459c22984c09101f5d4ed20021edb14593a9",
  "fa51541481b54b8ceb5f02612db099b8b7f508945e6070e7e605ac29bbc72a3a",
  "fb52b21018a6cfb7b65d543f87a42d0301d97dfdfaf24e790807b3c8b733a244",
]);

export function normalizeInvitationLookup(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return normalized
    .split(" ")
    .map((token) => lookupTokenReplacements[token] ?? token)
    .join(" ");
}

export function isRsvpInvitationLookupValid(value: unknown) {
  if (typeof value !== "string" || value.length === 0 || value.length > 256) {
    return false;
  }

  const normalizedValue = normalizeInvitationLookup(value);

  if (!normalizedValue) {
    return false;
  }

  const lookupHash = createHash("sha256")
    .update(normalizedValue)
    .digest("hex");

  return invitationLookupHashes.has(lookupHash);
}
