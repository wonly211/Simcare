<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, Pill } from 'lucide-vue-next';
import { canCreateHealth, todayMedication, labels } from '@simcare/shared';
import { state } from '../sync';
import { today } from '../state/client';
import HealthForm from '../components/HealthForm.vue';
const props = defineProps<{ ownerId: string }>();
const emit = defineEmits<{ navigate: [page: string] }>();
const showForm = ref(false);
const owner = computed(() => state.snapshot?.members.find((member) => member.id === props.ownerId));
const dosesByGroup = computed(() => {
  const result: { label: string; sortTime: string; doses: typeof doses.value }[] = [];
  for (const dose of doses.value) {
    const label =
      dose.schedule.period === 'as_needed'
        ? '按需用药'
        : dose.schedule.period === 'morning'
          ? '早餐'
          : dose.schedule.period === 'noon'
            ? '午餐'
            : dose.schedule.period === 'evening'
              ? '晚餐'
              : dose.schedule.time!;
    const sortTime = dose.sortTime;
    let group = result.find((item) => item.label === label && item.sortTime === sortTime);
    if (!group) {
      group = { label, sortTime, doses: [] };
      result.push(group);
    }
    group.doses.push(dose);
  }
  return result;
});
const doses = computed(() =>
  todayMedication(
    (state.snapshot?.medications ?? []).filter((item) => item.ownerId === props.ownerId),
    today.value,
  ),
);
const writableMembers = computed(() =>
  (state.snapshot?.members ?? []).filter(
    (member) =>
      member.active &&
      state.session &&
      canCreateHealth(state.session.user, member.id, state.snapshot?.grants ?? []),
  ),
);
const canCreate = computed(() =>
  writableMembers.value.some((member) => member.id === props.ownerId),
);
</script>
<template>
  <section class="page-section readable-overview">
    <h1>
      {{
        ownerId === state.session?.user.id
          ? '我的健康概览'
          : `${owner?.nickname ?? '成员'}的健康概览`
      }}
    </h1>
    <div class="overview-readable-grid">
      <section class="daily-section">
        <div class="section-heading"><h2>今天的用药</h2></div>
        <p class="muted">{{ today }} · {{ dosesByGroup.length }} 组安排</p>
        <div v-if="!dosesByGroup.length" class="readable-card small-empty">
          <Pill :size="28" />
          <p>今天没有用药安排</p>
        </div>
        <article
          v-for="group in dosesByGroup"
          :key="`${group.label}-${group.sortTime}`"
          class="readable-card medicine-group-card"
        >
          <h3>
            {{ group.label }}<span class="badge neutral">{{ group.doses.length }}种药</span>
          </h3>
          <div
            v-for="dose in group.doses"
            :key="`${dose.medication.id}-${dose.schedule.id}`"
            class="overview-dose-row"
          >
            <strong>{{ dose.medication.name }}</strong
            ><span
              >每次 {{ dose.schedule.dose }} {{ dose.schedule.unit }} ·
              {{ labels.meal[dose.schedule.meal] }}</span
            >
          </div>
        </article>
        <button class="button primary full-width" @click="emit('navigate', 'medication')">
          查看全部用药计划
        </button>
        <p class="page-footnote">这里只显示计划，不代表已经服药。</p>
      </section>
      <section class="daily-section">
        <div class="section-heading"><h2>健康记录</h2></div>
        <div class="readable-card">
          <p>记录日期、时间、血压、心率和血氧，方便持续了解健康变化。</p>
        </div>
        <button class="button secondary full-width" @click="emit('navigate', 'health')">
          查看健康记录
        </button>
        <button
          v-if="canCreate"
          class="button secondary full-width record-entry"
          @click="showForm = true"
        >
          <Plus :size="20" />为{{ owner?.nickname }}记录测量
        </button>
      </section>
    </div>
    <HealthForm
      v-if="showForm"
      :owner-id="ownerId"
      :members="writableMembers"
      @close="showForm = false"
    />
  </section>
</template>
