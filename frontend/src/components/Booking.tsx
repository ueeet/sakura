"use client";

// TODO: переписать под новый бэк (POST /bookings со startAt/endAt/branchId/saunaId).
// Полная логика — см. issue #3 (BookingPicker rewrite).

export function BookingForm() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Записаться онлайн
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Скоро здесь появится форма бронирования.
          <br />
          А пока позвоните нам — мы всегда на связи.
        </p>
      </div>
    </section>
  );
}
