# AMA Task -- Data Seeder (NestJS)

This NestJS project generates \~2000 car entities per minute.\
Interviewees must **fork this repository** and complete the required
implementation.

------------------------------------------------------------------------

## 🚀 Getting Started

### 1. Install dependencies

``` bash
yarn install
```

### 2. Start the server

``` bash
yarn start:dev
```

The data generator will begin automatically and emit car entities
continuously.

------------------------------------------------------------------------

## 🧩 Your Task

Inside the project, you will see a section marked:

``` ts
// TODO: implement data transfer handling
```

You must implement **your own logic** for handling the generated car
data.

Your implementation must correctly process **all generated entities**
(\~2000 per minute).

------------------------------------------------------------------------

## 🧪 Testing Your Implementation

To confirm your solution works:

1.  Start the project:

    ``` bash
    yarn start:dev
    ```

2.  Let it run for **approximately 5 minutes**.

3.  Verify that:

    -   your data-transfer logic is triggered for every generated
        entity
    -   no errors, drops, or crashes occur
    -   the app remains stable under continuous load

------------------------------------------------------------------------

## 📝 Notes

-   You may use any libraries, patterns, or architecture.
-   Keep the project simple, stable, and easy to review.
-   The focus is on correct data handling under load.
