# Third-Party Licenses and Attributions

**Last Updated:** January 2025  
**Aperae Mobile Application**

This document lists all third-party open-source libraries, frameworks, and dependencies used in the Aperae application, along with their respective licenses and copyright information.

---

## License Compatibility Summary

All dependencies listed below are licensed under **permissive licenses** (MIT, Apache 2.0, BSD, ISC) that are compatible with commercial use. **No copyleft (GPL) licenses are used**, ensuring full commercial use rights.

### License Types Used:
- ✅ **MIT License** - Permissive, commercial use allowed
- ✅ **Apache 2.0** - Permissive, commercial use allowed
- ✅ **BSD License** - Permissive, commercial use allowed
- ✅ **ISC License** - Permissive, commercial use allowed
- ❌ **No GPL/AGPL** - No copyleft licenses detected

---

## Frontend Dependencies

### Core Framework & Runtime
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `react` | 19.1.0 | MIT | Copyright (c) Facebook, Inc. and its affiliates |
| `react-dom` | 19.1.0 | MIT | Copyright (c) Facebook, Inc. and its affiliates |
| `react-native` | 0.81.4 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates |
| `expo` | ~54.0.0 | MIT | Copyright (c) 650 Industries, Inc. |

### Navigation
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@react-navigation/native` | ^6.1.9 | MIT | Copyright (c) React Navigation Contributors |
| `@react-navigation/stack` | ^6.3.20 | MIT | Copyright (c) React Navigation Contributors |
| `react-native-gesture-handler` | ^2.29.0 | MIT | Copyright (c) Software Mansion |
| `react-native-reanimated` | ^4.1.3 | MIT | Copyright (c) Software Mansion |
| `react-native-screens` | ~4.16.0 | MIT | Copyright (c) Software Mansion |
| `react-native-safe-area-context` | ~5.6.0 | MIT | Copyright (c) Th3rd Wave |

### Expo Modules
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@expo/metro-runtime` | ~6.1.2 | MIT | Copyright (c) 650 Industries, Inc. |
| `@expo/vector-icons` | ^15.0.2 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-camera` | ^17.0.8 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-crypto` | ~15.0.7 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-file-system` | ^19.0.17 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-image-picker` | ~17.0.8 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-linear-gradient` | ^15.0.7 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-media-library` | ^18.2.0 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-router` | ^6.0.7 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-secure-store` | ^15.0.7 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-sqlite` | ~16.0.8 | MIT | Copyright (c) 650 Industries, Inc. |
| `expo-status-bar` | ~3.0.8 | MIT | Copyright (c) 650 Industries, Inc. |

### Storage & Utilities
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@react-native-async-storage/async-storage` | 2.2.0 | MIT | Copyright (c) React Native Community |
| `react-native-web` | ^0.21.0 | MIT | Copyright (c) Nicolas Gallagher |

### Development Dependencies
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@babel/core` | ^7.20.0 | MIT | Copyright (c) Sebastian McKenzie |
| `@testing-library/jest-native` | ^5.4.0 | MIT | Copyright (c) Callstack |
| `@testing-library/react-native` | ^12.0.0 | MIT | Copyright (c) Callstack |
| `@types/jest` | ^29.5.0 | MIT | Copyright (c) DefinitelyTyped |
| `@types/react` | ~19.1.10 | MIT | Copyright (c) DefinitelyTyped |
| `@types/react-native` | ~0.73.0 | MIT | Copyright (c) DefinitelyTyped |
| `@typescript-eslint/eslint-plugin` | ^6.0.0 | MIT | Copyright (c) TypeScript ESLint |
| `@typescript-eslint/parser` | ^6.0.0 | MIT | Copyright (c) TypeScript ESLint |
| `eslint` | ^8.0.0 | MIT | Copyright (c) JS Foundation |
| `eslint-plugin-react` | ^7.0.0 | MIT | Copyright (c) Yannick Croissant |
| `eslint-plugin-react-hooks` | ^4.0.0 | MIT | Copyright (c) Facebook, Inc. |
| `eslint-plugin-react-native` | ^4.0.0 | MIT | Copyright (c) Airbnb |
| `jest` | ^29.0.0 | MIT | Copyright (c) Facebook, Inc. |
| `jest-expo` | ^50.0.0 | MIT | Copyright (c) 650 Industries, Inc. |
| `react-test-renderer` | 19.1.0 | MIT | Copyright (c) Facebook, Inc. |
| `typescript` | ~5.9.2 | Apache-2.0 | Copyright (c) Microsoft Corporation |

---

## Backend Dependencies

### Core Framework
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `express` | ^4.18.2 | MIT | Copyright (c) TJ Holowaychuk |
| `node` | - | Various | Node.js Foundation |

### AI & Cloud Services
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `openai` | ^4.104.0 | MIT | Copyright (c) OpenAI |
| `@google-cloud/vision` | ^5.3.4 | Apache-2.0 | Copyright (c) Google LLC |

### Authentication & Security
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `jsonwebtoken` | ^9.0.2 | MIT | Copyright (c) Auth0 |
| `bcrypt` | ^6.0.0 | MIT | Copyright (c) Nick Baugh |
| `helmet` | ^8.1.0 | MIT | Copyright (c) Adam Baldwin |

### Database & ORM
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@prisma/client` | ^5.22.0 | Apache-2.0 | Copyright (c) Prisma Data, Inc. |
| `prisma` | ^5.22.0 | Apache-2.0 | Copyright (c) Prisma Data, Inc. |

### Validation & Security
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `express-validator` | ^7.2.1 | MIT | Copyright (c) express-validator contributors |
| `express-rate-limit` | ^8.1.0 | MIT | Copyright (c) Nathan Friedly |

### Utilities
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `cors` | ^2.8.5 | MIT | Copyright (c) Troy Goode |
| `compression` | ^1.7.4 | MIT | Copyright (c) Douglas Christopher Wilson |
| `dotenv` | ^16.3.1 | BSD-2-Clause | Copyright (c) Sindre Sorhus |
| `morgan` | ^1.10.0 | MIT | Copyright (c) Express.js |
| `winston` | ^3.11.0 | MIT | Copyright (c) Nodejitsu Inc. |
| `csv-parser` | ^3.2.0 | MIT | Copyright (c) James Halliday |
| `sharp` | ^0.34.4 | Apache-2.0 | Copyright (c) Lovell Fuller |

### API Documentation
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `swagger-jsdoc` | ^6.2.8 | MIT | Copyright (c) Surnet |
| `swagger-ui-express` | ^5.0.0 | MIT | Copyright (c) swagger-ui-express contributors |

### Development Dependencies
| Package | Version | License | Copyright |
|---------|---------|---------|-----------|
| `@types/bcrypt` | ^6.0.0 | MIT | Copyright (c) DefinitelyTyped |
| `@types/jest` | ^30.0.0 | MIT | Copyright (c) DefinitelyTyped |
| `@types/jsonwebtoken` | ^9.0.10 | MIT | Copyright (c) DefinitelyTyped |
| `jest` | ^30.2.0 | MIT | Copyright (c) Facebook, Inc. |
| `nodemon` | ^3.0.1 | MIT | Copyright (c) Remy Sharp |
| `supertest` | ^7.1.4 | MIT | Copyright (c) TJ Holowaychuk |

---

## License Text References

### MIT License
Most dependencies use the MIT License. The MIT License text can be found at:
- https://opensource.org/licenses/MIT

### Apache License 2.0
The following packages use Apache License 2.0:
- `@google-cloud/vision`
- `@prisma/client` / `prisma`
- `sharp`
- `typescript`

Apache 2.0 License text: https://www.apache.org/licenses/LICENSE-2.0

### BSD-2-Clause License
- `dotenv`

BSD-2-Clause License text: https://opensource.org/licenses/BSD-2-Clause

---

## Attribution Requirements

### MIT License
All MIT-licensed packages require:
- Inclusion of copyright notice
- Inclusion of license text (or reference to it)
- No warranty disclaimer

**Compliance:** ✅ This document provides attribution for all MIT-licensed packages.

### Apache License 2.0
Apache 2.0-licensed packages require:
- Inclusion of copyright notice
- Inclusion of license text or reference
- Inclusion of NOTICE file (if provided by package)
- Attribution for modifications (if any)

**Compliance:** ✅ This document provides attribution for all Apache 2.0-licensed packages.

### BSD License
BSD-licensed packages require:
- Inclusion of copyright notice
- Inclusion of license text or reference

**Compliance:** ✅ This document provides attribution for BSD-licensed packages.

---

## Third-Party Service APIs

### OpenAI API
- **Service:** OpenAI GPT-4 API
- **Usage:** AI-powered wine recommendations
- **Terms:** https://openai.com/api/policies/terms/
- **Privacy:** https://openai.com/privacy/
- **Attribution:** Not required (per OpenAI Terms of Service)

### Google Cloud Vision API
- **Service:** Google Cloud Vision API (OCR)
- **Usage:** Text extraction from menu images
- **Terms:** https://cloud.google.com/terms/service-terms
- **Privacy:** https://cloud.google.com/privacy
- **Attribution:** Required (per Google Cloud Platform Terms of Service)
  - **Compliance:** Attribution displayed in app UI where OCR results are shown

---

## License Compatibility Verification

### Commercial Use
✅ **All licenses are compatible with commercial use.**
- MIT: ✅ Commercial use allowed
- Apache 2.0: ✅ Commercial use allowed
- BSD: ✅ Commercial use allowed

### Distribution
✅ **All licenses allow distribution of this application.**
- No copyleft (GPL) licenses detected
- All dependencies can be bundled with proprietary software

### Modification
✅ **All licenses allow modification of dependencies.**
- Modifications can be made as needed
- No requirement to share modifications

---

## Full License Texts

For full license texts of all dependencies, see the `LICENSE` files in each package's directory within `node_modules/`.

You can view license information for any package using:
```bash
npm list [package-name] --depth=0
```

Or view the LICENSE file directly:
```
node_modules/[package-name]/LICENSE
```

---

## Updates and Maintenance

This document should be updated:
- When new dependencies are added
- When dependencies are updated
- When license information changes
- Quarterly as part of dependency review

**Last Review Date:** January 2025  
**Next Review Date:** April 2025

---

## Contact

For questions about third-party licenses or attribution requirements, contact:
- **Legal:** legal@aperae.com
- **Technical:** dev@aperae.com

---

**Copyright (c) 2025 Aperae. All Rights Reserved.**

This document is part of the Aperae proprietary software and is subject to the terms of the main LICENSE file.


