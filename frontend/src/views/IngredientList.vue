<script setup>
import { onMounted, ref } from "vue";
import IngredientServices from "../services/IngredientServices.js";

const ingredients = ref([]);
const isAdd = ref(false);
const isEdit = ref(false);
const isDelete = ref(false);
const loading = ref(false);
const user = ref(null);
const apiError = ref("");
const fieldErrors = ref({
  name: "",
  unit: "",
  pricePerUnit: "",
});
const newIngredient = ref({
  id: undefined,
  name: undefined,
  unit: undefined,
  pricePerUnit: undefined,
});
const ingredientToDelete = ref(null);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getIngredients();
});

function trimValue(value) {
  return value == null ? "" : String(value).trim();
}

function clearFieldErrors() {
  fieldErrors.value = { name: "", unit: "", pricePerUnit: "" };
}

function validateForm() {
  clearFieldErrors();
  const name = trimValue(newIngredient.value.name);
  const unit = trimValue(newIngredient.value.unit);
  const pricePerUnit = trimValue(newIngredient.value.pricePerUnit);
  let valid = true;
  if (!name) {
    fieldErrors.value.name = "Ingredient name is required.";
    valid = false;
  }
  if (!unit) {
    fieldErrors.value.unit = "Ingredient unit is required.";
    valid = false;
  }
  if (!pricePerUnit) {
    fieldErrors.value.pricePerUnit = "Ingredient price per unit is required.";
    valid = false;
  }
  return valid;
}

function apiMessage(error) {
  return error?.response?.data?.message || "Something went wrong.";
}

async function getIngredients() {
  loading.value = true;
  apiError.value = "";
  await IngredientServices.getIngredients()
    .then((response) => {
      ingredients.value = response.data;
    })
    .catch((error) => {
      apiError.value = apiMessage(error);
    });
  loading.value = false;
}

async function addIngredient() {
  apiError.value = "";
  if (!validateForm()) {
    return;
  }
  const payload = { ...newIngredient.value };
  delete payload.id;
  await IngredientServices.addIngredient(payload)
    .then(async () => {
      isAdd.value = false;
      await getIngredients();
    })
    .catch((error) => {
      apiError.value = apiMessage(error);
    });
}

async function updateIngredient() {
  apiError.value = "";
  if (!validateForm()) {
    return;
  }
  await IngredientServices.updateIngredient(newIngredient.value)
    .then(async () => {
      isEdit.value = false;
      await getIngredients();
    })
    .catch((error) => {
      apiError.value = apiMessage(error);
    });
}

async function confirmDelete() {
  apiError.value = "";
  const id = ingredientToDelete.value?.id;
  isDelete.value = false;
  await IngredientServices.deleteIngredient(id)
    .then(async () => {
      ingredientToDelete.value = null;
      await getIngredients();
    })
    .catch((error) => {
      apiError.value = apiMessage(error);
    });
}

function openAdd() {
  newIngredient.value = {
    id: undefined,
    name: undefined,
    unit: undefined,
    pricePerUnit: undefined,
  };
  clearFieldErrors();
  apiError.value = "";
  isAdd.value = true;
}

function closeAdd() {
  isAdd.value = false;
}

function openEdit(item) {
  newIngredient.value = {
    id: item.id,
    name: item.name,
    unit: item.unit,
    pricePerUnit: item.pricePerUnit,
  };
  clearFieldErrors();
  apiError.value = "";
  isEdit.value = true;
}

function closeEdit() {
  isEdit.value = false;
}

function openDelete(item) {
  ingredientToDelete.value = item;
  isDelete.value = true;
}

function closeDelete() {
  isDelete.value = false;
  ingredientToDelete.value = null;
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="10">
          <v-card-title class="pl-0 text-h4 font-weight-bold"
            >Ingredients
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn
            v-if="user !== null"
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openAdd()"
            >+ New Ingredient</v-btn
          >
        </v-col>
      </v-row>

      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-alert
        v-if="apiError"
        type="error"
        density="compact"
        class="mb-4"
        >{{ apiError }}</v-alert
      >

      <v-table class="rounded-lg elevation-5">
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Unit</th>
            <th class="text-left">Price Per Unit</th>
            <th class="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in ingredients" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.unit }}</td>
            <td>${{ item.pricePerUnit }}</td>
            <td>
              <v-btn
                icon
                size="small"
                variant="text"
                aria-label="Edit Ingredient"
                @click="openEdit(item)"
              >
                <v-icon size="small" icon="mdi-pencil"></v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                aria-label="Delete ingredient"
                @click="openDelete(item)"
              >
                <v-icon size="small" icon="mdi-delete"></v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-dialog persistent contained :model-value="isAdd || isEdit" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-item>
            <v-card-title class="headline mb-2"
              >{{ isAdd ? "Add Ingredient" : isEdit ? "Edit Ingredient" : "" }}
            </v-card-title>
          </v-card-item>
          <v-card-text>
            <v-alert
              v-if="apiError"
              type="error"
              density="compact"
              class="mb-4"
              >{{ apiError }}</v-alert
            >
            <v-text-field
              v-model="newIngredient.name"
              label="Name"
              required
            ></v-text-field>
            <div v-if="fieldErrors.name">{{ fieldErrors.name }}</div>
            <v-text-field
              v-model="newIngredient.unit"
              label="Unit"
              required
            ></v-text-field>
            <div v-if="fieldErrors.unit">{{ fieldErrors.unit }}</div>
            <v-text-field
              v-model="newIngredient.pricePerUnit"
              label="Price Per Unit"
              required
            ></v-text-field>
            <div v-if="fieldErrors.pricePerUnit">
              {{ fieldErrors.pricePerUnit }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="flat"
              color="secondary"
              @click="isAdd ? closeAdd() : isEdit ? closeEdit() : false"
              >Close</v-btn
            >
            <v-btn
              variant="flat"
              color="primary"
              class="oc-cta"
              @click="
                isAdd ? addIngredient() : isEdit ? updateIngredient() : false
              "
              >{{
                isAdd ? "Add Ingredient" : isEdit ? "Update Ingredient" : ""
              }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog persistent contained :model-value="isDelete" width="500">
        <v-card class="rounded-lg elevation-5">
          <v-card-item>
            <v-card-title class="headline mb-2">Delete ingredient</v-card-title>
          </v-card-item>
          <v-card-text>
            Remove {{ ingredientToDelete?.name }} from your catalogue?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeDelete()"
              >Close</v-btn
            >
            <v-btn
              variant="flat"
              color="primary"
              class="oc-cta"
              @click="confirmDelete()"
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>
